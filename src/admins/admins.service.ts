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
import bcrypt from 'bcryptjs';
import { Model } from 'mongoose';

import {
  AdminResponseDto,
  LoginResponseDto,
  PaginationResponseDto,
} from './dto/admin-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin, AdminDocument } from './entities/admin.entity';

@Injectable()
export class AdminsService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async create(createAdminDto: CreateAdminDto): Promise<AdminResponseDto> {
    // Kiểm tra username đã tồn tại
    const existingUsername = await this.adminModel.findOne({
      username: createAdminDto.username,
    });
    if (existingUsername) {
      throw new ConflictException('Tên đăng nhập đã được sử dụng');
    }

    // Kiểm tra email đã tồn tại
    const existingEmail = await this.adminModel.findOne({
      email: createAdminDto.email,
    });
    if (existingEmail) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Hash password
    const saltRounds = this.configService.get('app.bcrypt.rounds');
    const hashedPassword = await bcrypt.hash(
      createAdminDto.password,
      saltRounds,
    );

    // Tạo admin mới
    const admin = new this.adminModel({
      ...createAdminDto,
      password: hashedPassword,
      role: createAdminDto.role || 'Staff',
    });

    const savedAdmin = await admin.save();
    return this.toAdminResponse(savedAdmin);
  }

  async login(loginAdminDto: LoginAdminDto): Promise<LoginResponseDto> {
    // Tìm admin theo username hoặc email
    const admin = await this.adminModel
      .findOne({
        $or: [
          { username: loginAdminDto.usernameOrEmail },
          { email: loginAdminDto.usernameOrEmail },
        ],
      })
      .select('+password');

    if (!admin) {
      throw new UnauthorizedException('Thông tin đăng nhập không đúng');
    }

    // Kiểm tra password
    const isPasswordValid = await bcrypt.compare(
      loginAdminDto.password,
      admin.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Thông tin đăng nhập không đúng');
    }

    // Cập nhật lastLogin
    await this.adminModel.findByIdAndUpdate(admin._id, {
      lastLogin: new Date(),
    });

    // Tạo JWT tokens
    const tokens = await this.generateTokens(admin._id.toString(), admin.role);

    return {
      admin: this.toAdminResponse(admin),
      ...tokens,
    };
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<PaginationResponseDto<AdminResponseDto>> {
    const skip = (page - 1) * limit;

    const [admins, total] = await Promise.all([
      this.adminModel
        .find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.adminModel.countDocuments(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: admins.map((admin) => this.toAdminResponse(admin)),
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async findOne(id: string): Promise<AdminResponseDto> {
    const admin = await this.adminModel.findById(id);

    if (!admin) {
      throw new NotFoundException('Không tìm thấy quản trị viên');
    }

    return this.toAdminResponse(admin);
  }

  async findByUsernameOrEmail(
    usernameOrEmail: string,
  ): Promise<AdminDocument | null> {
    return this.adminModel
      .findOne({
        $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      })
      .select('+password');
  }

  async update(
    id: string,
    updateAdminDto: UpdateAdminDto,
  ): Promise<AdminResponseDto> {
    // Kiểm tra admin tồn tại
    const existingAdmin = await this.adminModel.findById(id);
    if (!existingAdmin) {
      throw new NotFoundException('Không tìm thấy quản trị viên');
    }

    // Kiểm tra username trùng (nếu có thay đổi)
    if (
      updateAdminDto.username &&
      updateAdminDto.username !== existingAdmin.username
    ) {
      const usernameExists = await this.adminModel.findOne({
        username: updateAdminDto.username,
        _id: { $ne: id },
      });
      if (usernameExists) {
        throw new ConflictException('Tên đăng nhập đã được sử dụng');
      }
    }

    const updatedAdmin = await this.adminModel.findByIdAndUpdate(
      id,
      updateAdminDto,
      { new: true },
    );

    return this.toAdminResponse(updatedAdmin!);
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

    // Tìm admin
    const admin = await this.adminModel.findById(id).select('+password');
    if (!admin) {
      throw new NotFoundException('Không tìm thấy quản trị viên');
    }

    // Kiểm tra mật khẩu hiện tại
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      admin.password,
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
    await this.adminModel.findByIdAndUpdate(id, {
      password: hashedNewPassword,
    });

    return { message: 'Đổi mật khẩu thành công' };
  }

  async remove(id: string): Promise<{ message: string }> {
    const admin = await this.adminModel.findById(id);

    if (!admin) {
      throw new NotFoundException('Không tìm thấy quản trị viên');
    }

    // Không cho phép xóa SuperAdmin cuối cùng
    if (admin.role === 'SuperAdmin') {
      const superAdminCount = await this.adminModel.countDocuments({
        role: 'SuperAdmin',
      });
      if (superAdminCount <= 1) {
        throw new BadRequestException(
          'Không thể xóa quản trị viên cấp cao cuối cùng',
        );
      }
    }

    await this.adminModel.findByIdAndDelete(id);

    return { message: 'Xóa quản trị viên thành công' };
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('app.jwt.refreshSecret'),
      });

      const admin = await this.adminModel.findById(decoded.sub);
      if (!admin) {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      const accessToken = this.jwtService.sign(
        { sub: admin._id.toString(), type: 'admin', role: admin.role },
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

  private async generateTokens(adminId: string, role: string) {
    const payload = { sub: adminId, type: 'admin', role };

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

  private toAdminResponse(admin: AdminDocument): AdminResponseDto {
    return {
      _id: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      role: admin.role,
      lastLogin: admin.lastLogin,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }
}
