import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { CreateCustomerDto } from './create-customer.dto';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @ApiProperty({
    description: 'Họ và tên đầy đủ của khách hàng',
    example: 'Nguyễn Văn An',
    required: false,
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  @Length(2, 100, { message: 'Họ tên phải từ 2-100 ký tự' })
  fullName?: string;

  @ApiProperty({
    description: 'Số điện thoại khách hàng (10-11 chữ số)',
    example: '0987654321',
    required: false,
    pattern: '^[0-9]{10,11}$',
  })
  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @Matches(/^[0-9]{10,11}$/, {
    message: 'Số điện thoại phải có 10-11 chữ số',
  })
  phone?: string;

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

  // Không cho phép update email và password qua endpoint này
}
