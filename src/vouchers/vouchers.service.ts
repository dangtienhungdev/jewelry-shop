import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import {
  ValidateVoucherDto,
  VoucherValidationResponseDto,
} from './dto/voucher-response.dto';
import {
  DiscountType,
  Voucher,
  VoucherDocument,
} from './schemas/voucher.schema';

@Injectable()
export class VouchersService {
  constructor(
    @InjectModel(Voucher.name) private voucherModel: Model<VoucherDocument>,
  ) {}

  /**
   * Tạo voucher mới
   */
  async create(createVoucherDto: CreateVoucherDto): Promise<Voucher> {
    try {
      // Kiểm tra mã voucher đã tồn tại
      const existingVoucher = await this.voucherModel.findOne({
        discountCode: createVoucherDto.discountCode,
      });

      if (existingVoucher) {
        throw new BadRequestException('Mã voucher đã tồn tại');
      }

      // Validate dates
      const startDate = new Date(createVoucherDto.startDate);
      const endDate = new Date(createVoucherDto.endDate);

      if (startDate >= endDate) {
        throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
      }

      // Validate discount value for percentage type
      if (
        createVoucherDto.discountType === DiscountType.PERCENTAGE &&
        createVoucherDto.discountValue > 100
      ) {
        throw new BadRequestException(
          'Giá trị giảm giá theo phần trăm không được vượt quá 100%',
        );
      }

      const voucher = new this.voucherModel({
        ...createVoucherDto,
        startDate,
        endDate,
        usedCount: 0,
      });

      return await voucher.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Mã voucher đã tồn tại');
      }
      throw error;
    }
  }

  /**
   * Lấy danh sách voucher với filter và pagination
   */
  async findAll(
    query: any = {},
  ): Promise<{ vouchers: Voucher[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      isActive,
      discountType,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: any = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (discountType) {
      filter.discountType = discountType;
    }

    if (search) {
      filter.$or = [
        { discountCode: { $regex: search, $options: 'i' } },
        { discountName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort: any = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [vouchers, total] = await Promise.all([
      this.voucherModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('createdBy', 'username email')
        .exec(),
      this.voucherModel.countDocuments(filter),
    ]);

    return { vouchers, total };
  }

  /**
   * Lấy voucher theo ID
   */
  async findOne(id: string): Promise<Voucher> {
    const voucher = await this.voucherModel
      .findById(id)
      .populate('createdBy', 'username email')
      .exec();

    if (!voucher) {
      throw new NotFoundException('Không tìm thấy voucher');
    }

    return voucher;
  }

  /**
   * Lấy voucher theo mã
   */
  async findByCode(discountCode: string): Promise<Voucher> {
    const voucher = await this.voucherModel.findOne({ discountCode }).exec();

    if (!voucher) {
      throw new NotFoundException('Không tìm thấy mã voucher');
    }

    return voucher;
  }

  /**
   * Cập nhật voucher
   */
  async update(
    id: string,
    updateVoucherDto: UpdateVoucherDto,
  ): Promise<Voucher> {
    // Validate dates if both are provided
    if (updateVoucherDto.startDate && updateVoucherDto.endDate) {
      const startDate = new Date(updateVoucherDto.startDate);
      const endDate = new Date(updateVoucherDto.endDate);

      if (startDate >= endDate) {
        throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
      }
    }

    // Validate discount value for percentage type
    if (
      updateVoucherDto.discountType === DiscountType.PERCENTAGE &&
      updateVoucherDto.discountValue &&
      updateVoucherDto.discountValue > 100
    ) {
      throw new BadRequestException(
        'Giá trị giảm giá theo phần trăm không được vượt quá 100%',
      );
    }

    const voucher = await this.voucherModel
      .findByIdAndUpdate(id, updateVoucherDto, { new: true })
      .populate('createdBy', 'username email')
      .exec();

    if (!voucher) {
      throw new NotFoundException('Không tìm thấy voucher');
    }

    return voucher;
  }

  /**
   * Xóa voucher
   */
  async remove(id: string): Promise<void> {
    const result = await this.voucherModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Không tìm thấy voucher');
    }
  }

  /**
   * Kiểm tra tính hợp lệ của voucher và tính toán số tiền giảm
   */
  async validateVoucher(
    validateVoucherDto: ValidateVoucherDto,
  ): Promise<VoucherValidationResponseDto> {
    const { voucherCode, orderValue } = validateVoucherDto;

    try {
      const voucher = await this.findByCode(voucherCode);

      // Kiểm tra voucher có đang hoạt động không
      if (!voucher.isActive) {
        return {
          isValid: false,
          message: 'Voucher không hoạt động',
        };
      }

      const now = new Date();

      // Kiểm tra thời gian hiệu lực
      if (now < voucher.startDate) {
        return {
          isValid: false,
          message: 'Voucher chưa có hiệu lực',
        };
      }

      if (now > voucher.endDate) {
        return {
          isValid: false,
          message: 'Voucher đã hết hạn',
        };
      }

      // Kiểm tra giá trị đơn hàng tối thiểu
      if (orderValue < voucher.minOrderValue) {
        return {
          isValid: false,
          message: `Đơn hàng phải có giá trị tối thiểu ${this.formatCurrency(voucher.minOrderValue)}`,
        };
      }

      // Kiểm tra giới hạn sử dụng
      if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
        return {
          isValid: false,
          message: 'Voucher đã hết lượt sử dụng',
        };
      }

      // Tính toán số tiền giảm
      let discountAmount = 0;

      if (voucher.discountType === DiscountType.PERCENTAGE) {
        discountAmount = (orderValue * voucher.discountValue) / 100;
      } else {
        discountAmount = voucher.discountValue;
      }

      // Áp dụng giới hạn số tiền giảm tối đa
      if (
        voucher.maxDiscountAmount &&
        discountAmount > voucher.maxDiscountAmount
      ) {
        discountAmount = voucher.maxDiscountAmount;
      }

      return {
        isValid: true,
        message: 'Voucher hợp lệ',
        discountAmount,
        voucher: {
          _id: voucher._id.toString(),
          discountCode: voucher.discountCode,
          discountName: voucher.discountName,
          discountType: voucher.discountType,
          discountValue: voucher.discountValue,
          startDate: voucher.startDate,
          endDate: voucher.endDate,
          minOrderValue: voucher.minOrderValue,
          maxDiscountAmount: voucher.maxDiscountAmount,
          usageLimit: voucher.usageLimit,
          usedCount: voucher.usedCount,
          isActive: voucher.isActive,
          createdAt: voucher.createdAt,
          updatedAt: voucher.updatedAt,
        },
      };
    } catch (error) {
      return {
        isValid: false,
        message: error.message || 'Mã voucher không hợp lệ',
      };
    }
  }

  /**
   * Sử dụng voucher - tăng số lần sử dụng
   */
  async useVoucher(voucherId: string): Promise<Voucher> {
    const voucher = await this.voucherModel
      .findByIdAndUpdate(voucherId, { $inc: { usedCount: 1 } }, { new: true })
      .exec();

    if (!voucher) {
      throw new NotFoundException('Không tìm thấy voucher');
    }

    return voucher;
  }

  /**
   * Lấy danh sách voucher đang hoạt động
   */
  async getActiveVouchers(): Promise<Voucher[]> {
    const now = new Date();

    return await this.voucherModel
      .find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
        $or: [
          { usageLimit: { $exists: false } },
          { $expr: { $lt: ['$usedCount', '$usageLimit'] } },
        ],
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Format tiền tệ
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }
}
