import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Mật khẩu hiện tại',
    example: 'oldadminpassword123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống' })
  @IsString({ message: 'Mật khẩu hiện tại phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu hiện tại phải có ít nhất 6 ký tự' })
  currentPassword: string;

  @ApiProperty({
    description: 'Mật khẩu mới',
    example: 'newadminpassword123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString({ message: 'Mật khẩu mới phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  newPassword: string;

  @ApiProperty({
    description: 'Xác nhận mật khẩu mới',
    example: 'newadminpassword123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Xác nhận mật khẩu không được để trống' })
  @IsString({ message: 'Xác nhận mật khẩu phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Xác nhận mật khẩu phải có ít nhất 6 ký tự' })
  confirmPassword: string;
}
