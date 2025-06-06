import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({
    description: 'Tên đăng nhập của quản trị viên',
    example: 'admin01',
    minLength: 3,
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @IsString({ message: 'Tên đăng nhập phải là chuỗi ký tự' })
  @Length(3, 50, { message: 'Tên đăng nhập phải từ 3-50 ký tự' })
  username: string;

  @ApiProperty({
    description: 'Email quản trị viên (duy nhất)',
    example: 'admin@jewelry-shop.com',
    format: 'email',
  })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @ApiProperty({
    description: 'Mật khẩu (tối thiểu 6 ký tự)',
    example: 'adminpassword123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @ApiProperty({
    description: 'Vai trò của quản trị viên',
    example: 'Staff',
    enum: ['SuperAdmin', 'Staff'],
    default: 'Staff',
  })
  @IsOptional()
  @IsString({ message: 'Vai trò phải là chuỗi ký tự' })
  @IsEnum(['SuperAdmin', 'Staff'], {
    message: 'Vai trò phải là SuperAdmin hoặc Staff',
  })
  role?: string = 'Staff';
}
