import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Họ và tên đầy đủ của khách hàng',
    example: 'Nguyễn Văn An',
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  @Length(2, 100, { message: 'Họ tên phải từ 2-100 ký tự' })
  fullName: string;

  @ApiProperty({
    description: 'Số điện thoại khách hàng (10-11 chữ số)',
    example: '0987654321',
    pattern: '^[0-9]{10,11}$',
  })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @Matches(/^[0-9]{10,11}$/, {
    message: 'Số điện thoại phải có 10-11 chữ số',
  })
  phone: string;

  @ApiProperty({
    description: 'Email khách hàng (duy nhất)',
    example: 'nguyenvana@email.com',
    format: 'email',
  })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @ApiProperty({
    description: 'Mật khẩu (tối thiểu 6 ký tự)',
    example: 'password123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @ApiProperty({
    description: 'Địa chỉ khách hàng',
    example: '123 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
  @Length(0, 500, { message: 'Địa chỉ không được quá 500 ký tự' })
  address?: string;
}
