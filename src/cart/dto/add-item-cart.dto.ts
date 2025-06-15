import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class AddItemCartDto {
  @ApiProperty({
    description: 'ID sản phẩm cần thêm vào giỏ hàng',
    example: '60d5f484e1a2f5001f647product',
  })
  @IsNotEmpty({ message: 'ID sản phẩm không được để trống' })
  @IsString({ message: 'ID sản phẩm phải là chuỗi' })
  productId: string;

  @ApiProperty({
    description: 'Số lượng sản phẩm',
    example: 2,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  @IsNumber({}, { message: 'Số lượng phải là số' })
  @Min(1, { message: 'Số lượng phải lớn hơn 0' })
  quantity: number;
}
