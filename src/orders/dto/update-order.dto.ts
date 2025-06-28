import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../common/enums/order-status.enum';

export class UpdateOrderDto {
  @ApiProperty({
    description: 'Trạng thái đơn hàng',
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'Trạng thái đơn hàng không hợp lệ' })
  status?: OrderStatus;

  @ApiProperty({
    description: 'ID admin xử lý đơn hàng',
    example: '64f7b1234567890abcdef345',
    required: false,
  })
  @IsOptional()
  @IsMongoId({ message: 'Admin ID phải là ObjectId hợp lệ' })
  processedBy?: string;

  @ApiProperty({
    description: 'Ghi chú cập nhật',
    example: 'Đã xác nhận đơn hàng',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  notes?: string;
}
