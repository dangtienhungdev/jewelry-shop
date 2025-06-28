import { Document, Types } from 'mongoose';
import {
  PaymentMethod,
  PaymentStatus,
} from '../../common/enums/order-status.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { ApiProperty } from '@nestjs/swagger';

export type PaymentDocument = Payment & Document;

@Schema({
  timestamps: true,
  collection: 'payments',
})
export class Payment {
  @ApiProperty({
    description: 'ID thanh toán',
    example: '64f7b1234567890abcdef789',
  })
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  @ApiProperty({
    description: 'ID đơn hàng',
    example: '64f7b1234567890abcdef012',
  })
  orderId: Types.ObjectId;

  @Prop({ type: String, enum: PaymentMethod, required: true })
  @ApiProperty({
    description: 'Phương thức thanh toán',
    enum: PaymentMethod,
    example: PaymentMethod.PAYOS,
  })
  paymentMethod: PaymentMethod;

  @Prop({ default: Date.now })
  @ApiProperty({
    description: 'Ngày thanh toán',
    example: '2024-01-15T10:30:00.000Z',
  })
  paymentDate: Date;

  @Prop({ required: true, min: 0 })
  @ApiProperty({ description: 'Số tiền thanh toán', example: 90000000 })
  amount: number;

  @Prop()
  @ApiProperty({
    description: 'Mã giao dịch PayOS',
    example: 'PAY-20240115-001',
  })
  transactionCode?: string;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  @ApiProperty({
    description: 'Trạng thái thanh toán',
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Prop({ type: Types.ObjectId, ref: 'Admin' })
  @ApiProperty({
    description: 'ID admin xác nhận thanh toán',
    example: '64f7b1234567890abcdef345',
  })
  verifiedBy?: Types.ObjectId;

  @Prop()
  @ApiProperty({ description: 'PayOS Order ID', example: 123456 })
  payosOrderId?: number;

  @Prop()
  @ApiProperty({
    description: 'PayOS Payment Link ID',
    example: 'abc123def456',
  })
  payosPaymentLinkId?: string;

  @Prop()
  @ApiProperty({
    description: 'Ghi chú thanh toán',
    example: 'Thanh toán thành công qua PayOS',
  })
  notes?: string;

  @ApiProperty({ description: 'Ngày tạo', example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({
    description: 'Ngày cập nhật',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
