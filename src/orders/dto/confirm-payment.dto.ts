import { IsNumber, IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class ConfirmPaymentDto {
  @ApiProperty({
    description: 'Order ID (MongoDB ObjectId) hoặc Order Code',
    example: '64f7b1234567890abcdef789',
  })
  @IsString()
  orderId: string;

  @ApiProperty({
    description: 'PayOS transaction ID từ callback',
    example: '47663e80d280477ea6285371595d6dbc',
    required: false,
  })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiProperty({
    description: 'PayOS order code từ callback',
    example: 3572949215,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  payosOrderCode?: number;

  @ApiProperty({
    description: 'PayOS response code từ callback',
    example: '00',
    required: false,
  })
  @IsOptional()
  @IsString()
  responseCode?: string;

  @ApiProperty({
    description: 'Ghi chú bổ sung',
    example: 'Payment confirmed via frontend callback',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
