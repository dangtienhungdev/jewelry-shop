import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({
  timestamps: true, // Tự động thêm createdAt và updatedAt
  collection: 'products',
})
export class Product {
  @ApiProperty({
    description: 'ID sản phẩm (MongoDB ObjectId)',
    example: '60d5f484e1a2f5001f647abc',
  })
  _id: string;

  @Prop({
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 200,
  })
  @ApiProperty({
    description: 'Tên sản phẩm',
    example: 'Nhẫn Kim cương Solitaire 1 carat',
    minLength: 3,
    maxLength: 200,
  })
  productName: string;

  @Prop({
    trim: true,
    maxlength: 2000,
  })
  @ApiProperty({
    description: 'Mô tả sản phẩm',
    example:
      'Nhẫn kim cương solitaire với viên kim cương 1 carat, thiết kế cổ điển sang trọng',
    maxLength: 2000,
    required: false,
  })
  description?: string;

  @Prop({
    required: true,
    type: Number,
    min: 0,
  })
  @ApiProperty({
    description: 'Giá gốc (VNĐ)',
    example: 45000000,
    minimum: 0,
  })
  price: number;

  @Prop({
    type: Number,
    min: 0,
    default: null,
  })
  @ApiProperty({
    description: 'Giá sau giảm (VNĐ)',
    example: 42000000,
    minimum: 0,
    required: false,
  })
  discountedPrice?: number;

  @Prop({
    required: true,
    type: Number,
    min: 0,
  })
  @ApiProperty({
    description: 'Trọng lượng (gram)',
    example: 3.5,
    minimum: 0,
  })
  weight: number;

  @Prop({
    required: true,
    enum: [
      'Vàng 24k',
      'Vàng 18k',
      'Vàng 14k',
      'Bạc 925',
      'Bạc 999',
      'Kim cương',
      'Ngọc trai',
      'Đá quý',
      'Khác',
    ],
  })
  @ApiProperty({
    description: 'Chất liệu',
    example: 'Vàng 18k',
    enum: [
      'Vàng 24k',
      'Vàng 18k',
      'Vàng 14k',
      'Bạc 925',
      'Bạc 999',
      'Kim cương',
      'Ngọc trai',
      'Đá quý',
      'Khác',
    ],
  })
  material: string;

  @Prop({
    required: true,
    type: Number,
    min: 0,
    default: 0,
  })
  @ApiProperty({
    description: 'Số lượng tồn kho',
    example: 5,
    minimum: 0,
    default: 0,
  })
  stockQuantity: number;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'Category',
  })
  @ApiProperty({
    description: 'ID danh mục (MongoDB ObjectId)',
    example: '60d5f484e1a2f5001f647def',
  })
  categoryId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Admin', // Sẽ reference tới Admin khi có
    default: null,
  })
  @ApiProperty({
    description: 'ID admin tạo sản phẩm',
    example: '60d5f484e1a2f5001f647xyz',
    required: false,
  })
  createdBy?: Types.ObjectId;

  @Prop({
    type: Boolean,
    default: false,
  })
  @ApiProperty({
    description: 'Sản phẩm nổi bật',
    example: true,
    default: false,
  })
  isFeatured: boolean;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  @ApiProperty({
    description: 'Số lượt xem',
    example: 1250,
    minimum: 0,
    default: 0,
  })
  views: number;

  // Embedded discounts
  @Prop({
    type: [
      {
        discountId: { type: Types.ObjectId, ref: 'Discount' },
        appliedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  @ApiProperty({
    description: 'Danh sách giảm giá được áp dụng',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        discountId: { type: 'string', example: '60d5f484e1a2f5001f647xxx' },
        appliedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
    required: false,
  })
  discounts?: Array<{
    discountId: Types.ObjectId;
    appliedAt: Date;
  }>;

  @Prop({
    type: [String],
    default: [],
  })
  @ApiProperty({
    description: 'Danh sách URL hình ảnh',
    type: [String],
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    required: false,
  })
  images?: string[];

  @ApiProperty({
    description: 'Thời gian tạo sản phẩm',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật cuối cùng',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Indexes
ProductSchema.index({ productName: 'text', description: 'text' });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ material: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ stockQuantity: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ views: -1 });

// Compound indexes
ProductSchema.index({ categoryId: 1, isFeatured: 1 });
ProductSchema.index({ categoryId: 1, price: 1 });
ProductSchema.index({ material: 1, price: 1 });

// Virtual for id field
ProductSchema.virtual('id').get(function () {
  return this._id.toString();
});

// Virtual cho category populate
ProductSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true,
});

// Virtual cho admin populate
ProductSchema.virtual('admin', {
  ref: 'Admin',
  localField: 'createdBy',
  foreignField: '_id',
  justOne: true,
});

// Calculate effective price
ProductSchema.virtual('effectivePrice').get(function () {
  return this.discountedPrice || this.price;
});

// Calculate discount percentage
ProductSchema.virtual('discountPercentage').get(function () {
  if (!this.discountedPrice || this.discountedPrice >= this.price) {
    return 0;
  }
  return Math.round(((this.price - this.discountedPrice) / this.price) * 100);
});

// Transform to JSON
ProductSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    return ret;
  },
});
