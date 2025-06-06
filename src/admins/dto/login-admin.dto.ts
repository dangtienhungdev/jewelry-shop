import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginAdminDto {
  @ApiProperty({
    description: 'Username hoặc email đăng nhập',
    example: 'admin01',
  })
  @IsNotEmpty({ message: 'Username/Email không được để trống' })
  @IsString({ message: 'Username/Email phải là chuỗi ký tự' })
  usernameOrEmail: string;

  @ApiProperty({
    description: 'Mật khẩu đăng nhập',
    example: 'adminpassword123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;
}
