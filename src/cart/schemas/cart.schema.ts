import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema({
  timestamps: true,
  collection: 'carts',
})
export class Cart {
  @ApiProperty({
    description: 'ID giỏ hàng (MongoDB ObjectId)',
    example: '60d5f484e1a2f5001f647abc',
  })
  _id: string;

  @Prop({
    required: true,
    type: String,
    ref: 'Customer',
  })
  @ApiProperty({
    description: 'ID khách hàng sở hữu giỏ hàng',
    example: '60d5f484e1a2f5001f647customer',
  })
  customerId: string;

  @Prop({
    type: [
      {
        productId: {
          type: Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        discountedPrice: {
          type: Number,
          default: null,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    default: [],
  })
  @ApiProperty({
    description: 'Danh sách sản phẩm trong giỏ hàng',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        productId: { type: 'string', example: '60d5f484e1a2f5001f647product' },
        quantity: { type: 'number', example: 2 },
        price: { type: 'number', example: 50000000 },
        discountedPrice: { type: 'number', example: 45000000 },
        addedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  items: Array<{
    productId: Types.ObjectId;
    quantity: number;
    price: number;
    discountedPrice?: number;
    addedAt: Date;
  }>;

  @Prop({
    type: Number,
    default: 0,
  })
  @ApiProperty({
    description: 'Tổng tiền (tự động tính)',
    example: 90000000,
  })
  totalAmount: number;

  @Prop({
    type: Number,
    default: 0,
  })
  @ApiProperty({
    description: 'Tổng số lượng sản phẩm (tự động tính)',
    example: 2,
  })
  totalItems: number;

  @ApiProperty({
    description: 'Thời gian tạo giỏ hàng',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật cuối cùng',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// Indexes
CartSchema.index({ customerId: 1 }, { unique: true });
CartSchema.index({ 'items.productId': 1 });
CartSchema.index({ updatedAt: -1 });

// Pre-save middleware để tính toán tổng tiền và tổng số lượng
CartSchema.pre('save', function () {
  if (this.items && this.items.length > 0) {
    this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.totalAmount = this.items.reduce((sum, item) => {
      const effectivePrice = item.discountedPrice || item.price;
      return sum + effectivePrice * item.quantity;
    }, 0);
  } else {
    this.totalItems = 0;
    this.totalAmount = 0;
  }
});

// Virtual for id field
CartSchema.virtual('id').get(function () {
  return this._id.toString();
});

CartSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
