import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiProperty({
    description: 'Tên danh mục',
    example: 'Nhẫn Kim cương cao cấp',
    required: false,
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Tên danh mục phải là chuỗi ký tự' })
  @Length(2, 100, { message: 'Tên danh mục phải từ 2-100 ký tự' })
  categoryName?: string;

  @ApiProperty({
    description: 'Mô tả danh mục',
    example: 'Các loại nhẫn đính kim cương cao cấp được cập nhật',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  @Length(0, 500, { message: 'Mô tả không được quá 500 ký tự' })
  description?: string;

  @ApiProperty({
    description: 'ID danh mục cha (MongoDB ObjectId)',
    example: '60d5f484e1a2f5001f647def',
    required: false,
  })
  @IsOptional()
  @IsMongoId({ message: 'ID danh mục cha phải là MongoDB ObjectId hợp lệ' })
  parentId?: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái hoạt động phải là boolean' })
  isActive?: boolean;
}
