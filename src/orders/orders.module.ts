import { Order, OrderSchema } from './schemas/order.schema';
import { Payment, PaymentSchema } from './schemas/payment.schema';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PayOSService } from '../common/services/payos.service';
import { VouchersModule } from '../vouchers/vouchers.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    VouchersModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, PayOSService],
  exports: [OrdersService, PayOSService],
})
export class OrdersModule {}
