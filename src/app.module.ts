import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Import configurations
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';

// Import feature modules
import { AdminsModule } from './admins/admins.module';
import { CategoriesModule } from './categories/categories.module';
import { CustomersModule } from './customers/customers.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { OrderDetailModule } from './order-detail/order-detail.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: '.env',
    }),

    // Database
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri') || '',
        dbName: configService.get<string>('database.name') || 'jewelry-shop',
        ...(configService.get('database.options') || {}),
      }),
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: (configService.get('app.rateLimit.ttl') || 60) * 1000, // Convert to milliseconds
          limit: configService.get('app.rateLimit.limit') || 100,
        },
      ],
      inject: [ConfigService],
    }),

    // Feature modules
    CustomersModule,

    AdminsModule,

    CategoriesModule,

    ProductsModule,

    CartModule,

    OrdersModule,

    VouchersModule,

    OrderDetailModule,

    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
