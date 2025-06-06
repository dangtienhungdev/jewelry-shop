import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Min,
} from 'class-validator';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({
    description: 'Tên sản phẩm',
    example: 'Nhẫn Kim cương Solitaire 1 carat (Cập nhật)',
    required: false,
    minLength: 3,
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Tên sản phẩm phải là chuỗi ký tự' })
  @Length(3, 200, { message: 'Tên sản phẩm phải từ 3-200 ký tự' })
  productName?: string;

  @ApiProperty({
    description: 'Mô tả sản phẩm',
    example:
      'Nhẫn kim cương solitaire với viên kim cương 1 carat, thiết kế cổ điển sang trọng (Cập nhật)',
    required: false,
    maxLength: 2000,
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  @Length(0, 2000, { message: 'Mô tả không được quá 2000 ký tự' })
  description?: string;

  @ApiProperty({
    description: 'Giá gốc (VNĐ)',
    example: 50000000,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Giá phải là số' })
  @Min(0, { message: 'Giá phải lớn hơn hoặc bằng 0' })
  price?: number;

  @ApiProperty({
    description: 'Giá sau giảm (VNĐ)',
    example: 45000000,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Giá sau giảm phải là số' })
  @Min(0, { message: 'Giá sau giảm phải lớn hơn hoặc bằng 0' })
  discountedPrice?: number;

  @ApiProperty({
    description: 'Trọng lượng (gram)',
    example: 4.0,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Trọng lượng phải là số' })
  @Min(0, { message: 'Trọng lượng phải lớn hơn hoặc bằng 0' })
  weight?: number;

  @ApiProperty({
    description: 'Chất liệu',
    example: 'Vàng 24k',
    required: false,
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
  @IsOptional()
  @IsEnum(
    [
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
    { message: 'Chất liệu không hợp lệ' },
  )
  material?: string;

  @ApiProperty({
    description: 'Số lượng tồn kho',
    example: 10,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Số lượng tồn kho phải là số' })
  @Min(0, { message: 'Số lượng tồn kho phải lớn hơn hoặc bằng 0' })
  stockQuantity?: number;

  @ApiProperty({
    description: 'ID danh mục (MongoDB ObjectId)',
    example: '60d5f484e1a2f5001f647xyz',
    required: false,
  })
  @IsOptional()
  @IsMongoId({ message: 'ID danh mục phải là MongoDB ObjectId hợp lệ' })
  categoryId?: string;

  @ApiProperty({
    description: 'Sản phẩm nổi bật',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Sản phẩm nổi bật phải là boolean' })
  isFeatured?: boolean;

  @ApiProperty({
    description: 'Danh sách URL hình ảnh',
    type: [String],
    example: [
      'https://example.com/image1-updated.jpg',
      'https://example.com/image2-updated.jpg',
    ],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Danh sách hình ảnh phải là mảng' })
  @IsUrl({}, { each: true, message: 'Mỗi hình ảnh phải là URL hợp lệ' })
  images?: string[];
}
