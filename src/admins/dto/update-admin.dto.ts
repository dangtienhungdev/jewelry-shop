import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { CreateAdminDto } from './create-admin.dto';

export class UpdateAdminDto extends PartialType(CreateAdminDto) {
  @ApiProperty({
    description: 'Tên đăng nhập của quản trị viên',
    example: 'admin01_updated',
    required: false,
    minLength: 3,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Tên đăng nhập phải là chuỗi ký tự' })
  @Length(3, 50, { message: 'Tên đăng nhập phải từ 3-50 ký tự' })
  username?: string;

  @ApiProperty({
    description: 'Vai trò của quản trị viên',
    example: 'Staff',
    required: false,
    enum: ['SuperAdmin', 'Staff'],
  })
  @IsOptional()
  @IsString({ message: 'Vai trò phải là chuỗi ký tự' })
  @IsEnum(['SuperAdmin', 'Staff'], {
    message: 'Vai trò phải là SuperAdmin hoặc Staff',
  })
  role?: string;

  // Không cho phép update email và password qua endpoint này
}
