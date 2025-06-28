import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { DiscountType } from '../schemas/voucher.schema';

export class CreateVoucherDto {
  @ApiProperty({ description: 'Mã giảm giá', example: 'WELCOME10' })
  @IsString({ message: 'Mã giảm giá phải là chuỗi' })
  @MinLength(3, { message: 'Mã giảm giá phải có ít nhất 3 ký tự' })
  discountCode: string;

  @ApiProperty({ description: 'Tên voucher', example: 'Giảm giá chào mừng' })
  @IsString({ message: 'Tên voucher phải là chuỗi' })
  @MinLength(5, { message: 'Tên voucher phải có ít nhất 5 ký tự' })
  discountName: string;

  @ApiProperty({
    description: 'Loại giảm giá',
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
  })
  @IsEnum(DiscountType, { message: 'Loại giảm giá không hợp lệ' })
  discountType: DiscountType;

  @ApiProperty({
    description: 'Giá trị giảm giá (% hoặc số tiền)',
    example: 10,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Giá trị giảm giá phải là số' })
  @Min(0, { message: 'Giá trị giảm giá phải lớn hơn hoặc bằng 0' })
  discountValue: number;

  @ApiProperty({
    description: 'Ngày bắt đầu',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString({}, { message: 'Ngày bắt đầu phải là định dạng ngày hợp lệ' })
  startDate: string;

  @ApiProperty({
    description: 'Ngày kết thúc',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsDateString({}, { message: 'Ngày kết thúc phải là định dạng ngày hợp lệ' })
  endDate: string;

  @ApiProperty({
    description: 'Giá trị đơn hàng tối thiểu',
    example: 500000,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Giá trị đơn hàng tối thiểu phải là số' })
  @Min(0, { message: 'Giá trị đơn hàng tối thiểu phải lớn hơn hoặc bằng 0' })
  minOrderValue?: number;

  @ApiProperty({
    description: 'Số tiền giảm tối đa',
    example: 100000,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Số tiền giảm tối đa phải là số' })
  @Min(0, { message: 'Số tiền giảm tối đa phải lớn hơn hoặc bằng 0' })
  maxDiscountAmount?: number;

  @ApiProperty({
    description: 'Giới hạn số lượt sử dụng',
    example: 100,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Giới hạn sử dụng phải là số' })
  @Min(0, { message: 'Giới hạn sử dụng phải lớn hơn hoặc bằng 0' })
  usageLimit?: number;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái hoạt động phải là boolean' })
  isActive?: boolean;

  @ApiProperty({
    description: 'ID admin tạo voucher',
    example: '64f7b1234567890abcdef012',
  })
  @IsMongoId({ message: 'Admin ID phải là ObjectId hợp lệ' })
  createdBy: string;

  @ApiProperty({
    description: 'Mô tả voucher',
    example: 'Áp dụng cho khách hàng mới',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;
}
