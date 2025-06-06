import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({
  timestamps: true, // Tự động thêm createdAt và updatedAt
  collection: 'categories',
})
export class Category {
  @ApiProperty({
    description: 'ID danh mục (MongoDB ObjectId)',
    example: '60d5f484e1a2f5001f647abc',
  })
  _id: string;

  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  })
  @ApiProperty({
    description: 'Tên danh mục',
    example: 'Nhẫn Kim cương',
    minLength: 2,
    maxLength: 100,
  })
  categoryName: string;

  @Prop({
    trim: true,
    maxlength: 500,
  })
  @ApiProperty({
    description: 'Mô tả danh mục',
    example: 'Các loại nhẫn đính kim cương cao cấp',
    maxLength: 500,
    required: false,
  })
  description?: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
    default: null,
  })
  @ApiProperty({
    description: 'ID danh mục cha (null nếu là danh mục gốc)',
    example: '60d5f484e1a2f5001f647def',
    required: false,
  })
  parentId?: Types.ObjectId;

  @Prop({
    type: Boolean,
    default: true,
  })
  @ApiProperty({
    description: 'Trạng thái hoạt động của danh mục',
    example: true,
    default: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Thời gian tạo danh mục',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật cuối cùng',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Indexes
CategorySchema.index({ categoryName: 1 });
CategorySchema.index({ parentId: 1 });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ createdAt: -1 });

// Virtual for id field
CategorySchema.virtual('id').get(function () {
  return this._id.toString();
});

// Virtual cho subcategories
CategorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId',
});

// Virtual cho parent category
CategorySchema.virtual('parent', {
  ref: 'Category',
  localField: 'parentId',
  foreignField: '_id',
  justOne: true,
});

// Transform to JSON
CategorySchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    return ret;
  },
});
