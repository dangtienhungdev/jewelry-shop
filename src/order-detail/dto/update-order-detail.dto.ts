import { PartialType } from '@nestjs/swagger';
import { CreateOrderDetailDto } from './create-order-detail.dto';

export class UpdateOrderDetailDto extends PartialType(CreateOrderDetailDto) {}
