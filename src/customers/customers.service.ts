import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import {
  CustomerResponseDto,
  LoginResponseDto,
  PaginationResponseDto,
} from './dto/customer-response.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer, CustomerDocument } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async register(
    createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    // Kiểm tra email đã tồn tại
    const existingEmail = await this.customerModel.findOne({
      email: createCustomerDto.email,
    });
    if (existingEmail) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Kiểm tra số điện thoại đã tồn tại
    const existingPhone = await this.customerModel.findOne({
      phone: createCustomerDto.phone,
    });
    if (existingPhone) {
      throw new ConflictException('Số điện thoại đã được sử dụng');
    }

    // Hash password
    const saltRounds = this.configService.get('app.bcrypt.rounds');
    const hashedPassword = await bcrypt.hash(
      createCustomerDto.password,
      saltRounds,
    );

    // Tạo customer mới
    const customer = new this.customerModel({
      ...createCustomerDto,
      password: hashedPassword,
    });

    const savedCustomer = await customer.save();
    return this.toCustomerResponse(savedCustomer);
  }

  async login(loginCustomerDto: LoginCustomerDto): Promise<LoginResponseDto> {
    // Tìm customer theo email
    const customer = await this.customerModel
      .findOne({ email: loginCustomerDto.email })
      .select('+password');

    if (!customer) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Kiểm tra password
    const isPasswordValid = await bcrypt.compare(
      loginCustomerDto.password,
      customer.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Tạo JWT tokens
    const tokens = await this.generateTokens(customer._id.toString());

    return {
      customer: this.toCustomerResponse(customer),
      ...tokens,
    };
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<PaginationResponseDto<CustomerResponseDto>> {
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      this.customerModel
        .find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.customerModel.countDocuments(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: customers.map((customer) => this.toCustomerResponse(customer)),
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async findOne(id: string): Promise<CustomerResponseDto> {
    const customer = await this.customerModel.findById(id);

    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }

    return this.toCustomerResponse(customer);
  }

  async findByEmail(email: string): Promise<CustomerDocument | null> {
    return this.customerModel.findOne({ email }).select('+password');
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    // Kiểm tra customer tồn tại
    const existingCustomer = await this.customerModel.findById(id);
    if (!existingCustomer) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }

    // Kiểm tra số điện thoại trùng (nếu có thay đổi)
    if (
      updateCustomerDto.phone &&
      updateCustomerDto.phone !== existingCustomer.phone
    ) {
      const phoneExists = await this.customerModel.findOne({
        phone: updateCustomerDto.phone,
        _id: { $ne: id },
      });
      if (phoneExists) {
        throw new ConflictException('Số điện thoại đã được sử dụng');
      }
    }

    const updatedCustomer = await this.customerModel.findByIdAndUpdate(
      id,
      updateCustomerDto,
      { new: true },
    );

    return this.toCustomerResponse(updatedCustomer!);
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    // Kiểm tra mật khẩu mới và xác nhận mật khẩu
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException(
        'Mật khẩu mới và xác nhận mật khẩu không khớp',
      );
    }

    // Tìm customer
    const customer = await this.customerModel.findById(id).select('+password');
    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }

    // Kiểm tra mật khẩu hiện tại
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      customer.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }

    // Hash mật khẩu mới
    const saltRounds = this.configService.get('app.bcrypt.rounds');
    const hashedNewPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      saltRounds,
    );

    // Cập nhật mật khẩu
    await this.customerModel.findByIdAndUpdate(id, {
      password: hashedNewPassword,
    });

    return { message: 'Đổi mật khẩu thành công' };
  }

  async remove(id: string): Promise<{ message: string }> {
    const customer = await this.customerModel.findById(id);

    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }

    await this.customerModel.findByIdAndDelete(id);

    return { message: 'Xóa khách hàng thành công' };
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('app.jwt.refreshSecret'),
      });

      const customer = await this.customerModel.findById(decoded.sub);
      if (!customer) {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      const accessToken = this.jwtService.sign(
        { sub: customer._id.toString(), type: 'customer' },
        {
          secret: this.configService.get('app.jwt.secret'),
          expiresIn: this.configService.get('app.jwt.expiresIn'),
        },
      );

      return {
        accessToken,
        expiresIn: 86400, // 24 hours
      };
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ');
    }
  }

  private async generateTokens(customerId: string) {
    const payload = { sub: customerId, type: 'customer' };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('app.jwt.secret'),
        expiresIn: this.configService.get('app.jwt.expiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('app.jwt.refreshSecret'),
        expiresIn: this.configService.get('app.jwt.refreshExpiresIn'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 86400, // 24 hours
    };
  }

  private toCustomerResponse(customer: CustomerDocument): CustomerResponseDto {
    return {
      _id: customer._id.toString(),
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}
