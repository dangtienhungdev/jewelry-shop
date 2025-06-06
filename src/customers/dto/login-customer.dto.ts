import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginCustomerDto {
  @ApiProperty({
    description: 'Email đăng nhập',
    example: 'nguyenvana@email.com',
    format: 'email',
  })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @ApiProperty({
    description: 'Mật khẩu đăng nhập',
    example: 'password123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;
}
