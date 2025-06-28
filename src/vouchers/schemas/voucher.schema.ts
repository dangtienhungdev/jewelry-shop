import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { ApiProperty } from '@nestjs/swagger';

export type VoucherDocument = Voucher & Document;

export enum DiscountType {
  PERCENTAGE = 'Percentage',
  FIXED_AMOUNT = 'FixedAmount',
}

@Schema({
  timestamps: true,
  collection: 'vouchers',
})
export class Voucher {
  @ApiProperty({
    description: 'ID voucher',
    example: '64f7b1234567890abcdef789',
  })
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  @ApiProperty({ description: 'Mã giảm giá', example: 'WELCOME10' })
  discountCode: string;

  @Prop({ required: true })
  @ApiProperty({ description: 'Tên voucher', example: 'Giảm giá chào mừng' })
  discountName: string;

  @Prop({ type: String, enum: DiscountType, required: true })
  @ApiProperty({
    description: 'Loại giảm giá',
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
  })
  discountType: DiscountType;

  @Prop({ required: true, min: 0 })
  @ApiProperty({
    description: 'Giá trị giảm giá (% hoặc số tiền)',
    example: 10,
  })
  discountValue: number;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Ngày bắt đầu',
    example: '2024-01-01T00:00:00.000Z',
  })
  startDate: Date;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Ngày kết thúc',
    example: '2024-12-31T23:59:59.000Z',
  })
  endDate: Date;

  @Prop({ default: 0, min: 0 })
  @ApiProperty({ description: 'Giá trị đơn hàng tối thiểu', example: 500000 })
  minOrderValue: number;

  @Prop({ min: 0 })
  @ApiProperty({ description: 'Số tiền giảm tối đa', example: 100000 })
  maxDiscountAmount?: number;

  @Prop({ min: 0 })
  @ApiProperty({ description: 'Giới hạn số lượt sử dụng', example: 100 })
  usageLimit?: number;

  @Prop({ default: 0, min: 0 })
  @ApiProperty({ description: 'Số lần đã sử dụng', example: 5 })
  usedCount: number;

  @Prop({ default: true })
  @ApiProperty({ description: 'Trạng thái hoạt động', example: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Admin', required: true })
  @ApiProperty({
    description: 'ID admin tạo voucher',
    example: '64f7b1234567890abcdef012',
  })
  createdBy: Types.ObjectId;

  @Prop()
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

export const VoucherSchema = SchemaFactory.createForClass(Voucher);
