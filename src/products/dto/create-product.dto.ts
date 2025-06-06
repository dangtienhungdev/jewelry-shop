import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Tên sản phẩm',
    example: 'Nhẫn Kim cương Solitaire 1 carat',
    minLength: 3,
    maxLength: 200,
  })
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  @IsString({ message: 'Tên sản phẩm phải là chuỗi ký tự' })
  @Length(3, 200, { message: 'Tên sản phẩm phải từ 3-200 ký tự' })
  productName: string;

  @ApiProperty({
    description: 'Mô tả sản phẩm',
    example:
      'Nhẫn kim cương solitaire với viên kim cương 1 carat, thiết kế cổ điển sang trọng',
    required: false,
    maxLength: 2000,
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  @Length(0, 2000, { message: 'Mô tả không được quá 2000 ký tự' })
  description?: string;

  @ApiProperty({
    description: 'Giá gốc (VNĐ)',
    example: 45000000,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Giá không được để trống' })
  @IsNumber({}, { message: 'Giá phải là số' })
  @Min(0, { message: 'Giá phải lớn hơn hoặc bằng 0' })
  price: number;

  @ApiProperty({
    description: 'Giá sau giảm (VNĐ)',
    example: 42000000,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Giá sau giảm phải là số' })
  @Min(0, { message: 'Giá sau giảm phải lớn hơn hoặc bằng 0' })
  discountedPrice?: number;

  @ApiProperty({
    description: 'Trọng lượng (gram)',
    example: 3.5,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Trọng lượng không được để trống' })
  @IsNumber({}, { message: 'Trọng lượng phải là số' })
  @Min(0, { message: 'Trọng lượng phải lớn hơn hoặc bằng 0' })
  weight: number;

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
  @IsNotEmpty({ message: 'Chất liệu không được để trống' })
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
  material: string;

  @ApiProperty({
    description: 'Số lượng tồn kho',
    example: 5,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Số lượng tồn kho phải là số' })
  @Min(0, { message: 'Số lượng tồn kho phải lớn hơn hoặc bằng 0' })
  stockQuantity?: number = 0;

  @ApiProperty({
    description: 'ID danh mục (MongoDB ObjectId)',
    example: '60d5f484e1a2f5001f647def',
  })
  @IsNotEmpty({ message: 'ID danh mục không được để trống' })
  @IsMongoId({ message: 'ID danh mục phải là MongoDB ObjectId hợp lệ' })
  categoryId: string;

  @ApiProperty({
    description: 'Sản phẩm nổi bật',
    example: true,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Sản phẩm nổi bật phải là boolean' })
  isFeatured?: boolean = false;

  @ApiProperty({
    description: 'Danh sách URL hình ảnh',
    type: [String],
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Danh sách hình ảnh phải là mảng' })
  @IsUrl({}, { each: true, message: 'Mỗi hình ảnh phải là URL hợp lệ' })
  images?: string[];
}
