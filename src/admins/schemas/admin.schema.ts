import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type AdminDocument = Admin & Document;

@Schema({
  timestamps: true, // Tự động thêm createdAt và updatedAt
  collection: 'admins',
})
export class Admin {
  @ApiProperty({
    description: 'ID quản trị viên (MongoDB ObjectId)',
    example: '60d5f484e1a2f5001f647abc',
  })
  _id: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  })
  @ApiProperty({
    description: 'Tên đăng nhập của quản trị viên',
    example: 'admin01',
    minLength: 3,
    maxLength: 50,
  })
  username: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  })
  @ApiProperty({
    description: 'Email quản trị viên (duy nhất)',
    example: 'admin@jewelry-shop.com',
    format: 'email',
  })
  email: string;

  @Prop({
    required: true,
    minlength: 6,
  })
  @ApiProperty({
    description: 'Mật khẩu đã được hash',
    example: '$2b$12$hashedPassword...',
    writeOnly: true,
  })
  password: string;

  @Prop({
    required: true,
    enum: ['SuperAdmin', 'Staff'],
    default: 'Staff',
  })
  @ApiProperty({
    description: 'Vai trò của quản trị viên',
    example: 'Staff',
    enum: ['SuperAdmin', 'Staff'],
  })
  role: string;

  @Prop({
    type: Date,
    default: null,
  })
  @ApiProperty({
    description: 'Thời gian đăng nhập cuối cùng',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  lastLogin?: Date;

  @ApiProperty({
    description: 'Thời gian tạo tài khoản',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật cuối cùng',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

// Indexes
AdminSchema.index({ username: 1 }, { unique: true });
AdminSchema.index({ email: 1 }, { unique: true });
AdminSchema.index({ role: 1 });
AdminSchema.index({ createdAt: -1 });
AdminSchema.index({ lastLogin: -1 });

// Virtual for id field
AdminSchema.virtual('id').get(function () {
  return this._id.toString();
});

// Transform to JSON
AdminSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password; // Không trả về password trong response
    return ret;
  },
});
