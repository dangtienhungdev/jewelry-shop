import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateItemCartDto {
  @ApiProperty({
    description: 'Số lượng sản phẩm mới',
    example: 3,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  @IsNumber({}, { message: 'Số lượng phải là số' })
  @Min(1, { message: 'Số lượng phải lớn hơn 0' })
  quantity: number;
}
