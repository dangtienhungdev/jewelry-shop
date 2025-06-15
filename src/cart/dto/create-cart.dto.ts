import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCartDto {
  @ApiProperty({
    description: 'ID khách hàng tạo giỏ hàng',
    example: '60d5f484e1a2f5001f647customer',
  })
  @IsNotEmpty({ message: 'ID khách hàng không được để trống' })
  @IsString({ message: 'ID khách hàng phải là chuỗi' })
  customerId: string;
}
