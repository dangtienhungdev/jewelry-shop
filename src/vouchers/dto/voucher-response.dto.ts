import { IsNumber, IsString, Min } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { DiscountType } from '../schemas/voucher.schema';

export class VoucherResponseDto {
  @ApiProperty({
    description: 'ID voucher',
    example: '64f7b1234567890abcdef789',
  })
  _id: string;

  @ApiProperty({ description: 'Mã giảm giá', example: 'WELCOME10' })
  discountCode: string;

  @ApiProperty({ description: 'Tên voucher', example: 'Giảm giá chào mừng' })
  discountName: string;

  @ApiProperty({ description: 'Loại giảm giá', enum: DiscountType })
  discountType: DiscountType;

  @ApiProperty({
    description: 'Giá trị giảm giá (% hoặc số tiền)',
    example: 10,
  })
  discountValue: number;

  @ApiProperty({
    description: 'Ngày bắt đầu',
    example: '2024-01-01T00:00:00.000Z',
  })
  startDate: Date;

  @ApiProperty({
    description: 'Ngày kết thúc',
    example: '2024-12-31T23:59:59.000Z',
  })
  endDate: Date;

  @ApiProperty({ description: 'Giá trị đơn hàng tối thiểu', example: 500000 })
  minOrderValue: number;

  @ApiProperty({ description: 'Số tiền giảm tối đa', example: 100000 })
  maxDiscountAmount?: number;

  @ApiProperty({ description: 'Giới hạn số lượt sử dụng', example: 100 })
  usageLimit?: number;

  @ApiProperty({ description: 'Số lần đã sử dụng', example: 5 })
  usedCount: number;

  @ApiProperty({ description: 'Trạng thái hoạt động', example: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Mô tả voucher',
    example: 'Áp dụng cho khách hàng mới',
  })
  description?: string;

  @ApiProperty({ description: 'Ngày tạo', example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({
    description: 'Ngày cập nhật',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}

export class ValidateVoucherDto {
  @ApiProperty({ description: 'Mã voucher cần kiểm tra', example: 'WELCOME10' })
  @IsString({ message: 'Mã voucher phải là chuỗi' })
  voucherCode: string;

  @ApiProperty({
    description: 'Tổng giá trị đơn hàng',
    example: 1000000,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Tổng giá trị đơn hàng phải là số' })
  @Min(0, { message: 'Tổng giá trị đơn hàng phải lớn hơn hoặc bằng 0' })
  orderValue: number;
}

export class VoucherValidationResponseDto {
  @ApiProperty({ description: 'Voucher có hợp lệ không', example: true })
  isValid: boolean;

  @ApiProperty({ description: 'Thông báo', example: 'Voucher hợp lệ' })
  message: string;

  @ApiProperty({ description: 'Số tiền được giảm', example: 100000 })
  discountAmount?: number;

  @ApiProperty({ description: 'Thông tin voucher', type: VoucherResponseDto })
  voucher?: VoucherResponseDto;
}
