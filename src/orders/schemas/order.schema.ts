import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../common/enums/order-status.enum';

export type OrderDocument = Order & Document;

@Schema({ _id: false })
export class OrderDetail {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  @ApiProperty({
    description: 'ID sản phẩm',
    example: '64f7b1234567890abcdef123',
  })
  productId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  @ApiProperty({ description: 'Số lượng', example: 2 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  @ApiProperty({ description: 'Giá tại thời điểm mua', example: 50000000 })
  priceAtPurchase: number;

  @Prop({ default: 0, min: 0 })
  @ApiProperty({ description: 'Giảm giá áp dụng', example: 0 })
  discountApplied: number;
}

@Schema({ _id: false })
export class AppliedDiscount {
  @Prop({ type: Types.ObjectId, ref: 'Voucher', required: true })
  @ApiProperty({
    description: 'ID voucher',
    example: '64f7b1234567890abcdef456',
  })
  discountId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  @ApiProperty({ description: 'Số tiền giảm thực tế', example: 100000 })
  discountAmount: number;
}

@Schema({
  timestamps: true,
  collection: 'orders',
})
export class Order {
  @ApiProperty({
    description: 'ID đơn hàng',
    example: '64f7b1234567890abcdef789',
  })
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  @ApiProperty({
    description: 'ID khách hàng',
    example: '64f7b1234567890abcdef012',
  })
  customerId: Types.ObjectId;

  @Prop({ default: Date.now })
  @ApiProperty({
    description: 'Ngày đặt hàng',
    example: '2024-01-15T10:30:00.000Z',
  })
  orderDate: Date;

  @Prop({ required: true, min: 0 })
  @ApiProperty({ description: 'Tổng tiền hàng', example: 100000000 })
  totalAmount: number;

  @Prop({ default: 0, min: 0 })
  @ApiProperty({ description: 'Số tiền giảm giá', example: 10000000 })
  discountAmount: number;

  @Prop({ required: true, min: 0 })
  @ApiProperty({ description: 'Số tiền phải thanh toán', example: 90000000 })
  finalAmount: number;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING })
  @ApiProperty({
    description: 'Trạng thái đơn hàng',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Prop({ required: true })
  @ApiProperty({
    description: 'Địa chỉ giao hàng',
    example: '123 Nguyễn Huệ, Q1, HCM',
  })
  shippingAddress: string;

  @Prop({ type: Types.ObjectId, ref: 'Admin' })
  @ApiProperty({
    description: 'ID admin xử lý',
    example: '64f7b1234567890abcdef345',
  })
  processedBy?: Types.ObjectId;

  @Prop()
  @ApiProperty({
    description: 'Ghi chú đơn hàng',
    example: 'Giao hàng buổi sáng',
  })
  notes?: string;

  @Prop({ type: [OrderDetail], required: true })
  @ApiProperty({ description: 'Chi tiết đơn hàng', type: [OrderDetail] })
  orderDetails: OrderDetail[];

  @Prop({ type: [AppliedDiscount], default: [] })
  @ApiProperty({ description: 'Voucher đã áp dụng', type: [AppliedDiscount] })
  appliedDiscounts: AppliedDiscount[];

  @Prop()
  @ApiProperty({ description: 'Mã đơn hàng', example: 'ORD-20240115-001' })
  orderCode?: string;

  @Prop()
  @ApiProperty({ description: 'Tên người nhận', example: 'Nguyễn Văn A' })
  recipientName?: string;

  @Prop()
  @ApiProperty({ description: 'SĐT người nhận', example: '0987654321' })
  recipientPhone?: string;

  @Prop({ default: 0 })
  @ApiProperty({ description: 'Phí vận chuyển', example: 30000 })
  shippingFee: number;

  @ApiProperty({ description: 'Ngày tạo', example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({
    description: 'Ngày cập nhật',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Pre-save middleware to generate order code
OrderSchema.pre('save', function (next) {
  if (this.isNew && !this.orderCode) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = Date.now().toString().slice(-4);
    this.orderCode = `ORD-${dateStr}-${timeStr}`;
  }
  next();
});
