import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../common/enums/order-status.enum';
import { Type } from 'class-transformer';

export class CreateOrderDetailDto {
  @ApiProperty({
    description: 'ID sản phẩm trong database (ObjectId)',
    examples: {
      ring: {
        summary: 'Nhẫn kim cương',
        value: '64f7b1234567890abcdef123',
      },
      necklace: {
        summary: 'Vòng cổ ngọc trai',
        value: '64f7b1234567890abcdef456',
      },
      earring: {
        summary: 'Bông tai vàng',
        value: '64f7b1234567890abcdef789',
      },
    },
    example: '64f7b1234567890abcdef123',
  })
  @IsMongoId({ message: 'Product ID phải là ObjectId hợp lệ' })
  productId: string;

  @ApiProperty({
    description: 'Số lượng sản phẩm mua',
    examples: {
      single: {
        summary: 'Mua 1 sản phẩm',
        value: 1,
      },
      multiple: {
        summary: 'Mua nhiều sản phẩm cùng loại',
        value: 3,
      },
      pair: {
        summary: 'Mua 1 cặp (bông tai)',
        value: 2,
      },
    },
    example: 1,
    minimum: 1,
  })
  @IsNumber({}, { message: 'Số lượng phải là số' })
  @Min(1, { message: 'Số lượng phải lớn hơn 0' })
  quantity: number;

  @ApiProperty({
    description: 'Giá sản phẩm tại thời điểm đặt hàng (VND)',
    examples: {
      luxury: {
        summary: 'Nhẫn kim cương cao cấp',
        value: 45000000,
      },
      mid: {
        summary: 'Vòng cổ ngọc trai',
        value: 8500000,
      },
      basic: {
        summary: 'Bông tai bạc',
        value: 2500000,
      },
    },
    example: 45000000,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Giá phải là số' })
  @Min(0, { message: 'Giá phải lớn hơn hoặc bằng 0' })
  priceAtPurchase: number;

  @ApiProperty({
    description: 'Số tiền giảm giá áp dụng riêng cho sản phẩm này (VND)',
    examples: {
      noDiscount: {
        summary: 'Không có giảm giá',
        value: 0,
      },
      smallDiscount: {
        summary: 'Giảm giá nhỏ',
        value: 500000,
      },
      bigDiscount: {
        summary: 'Giảm giá lớn',
        value: 2000000,
      },
    },
    example: 0,
    minimum: 0,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Giảm giá phải là số' })
  @Min(0, { message: 'Giảm giá phải lớn hơn hoặc bằng 0' })
  discountApplied?: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID khách hàng (ObjectId)',
    example: '64f7b1234567890abcdef012',
    required: true,
  })
  @IsMongoId({ message: 'Customer ID phải là ObjectId hợp lệ' })
  customerId: string;

  @ApiProperty({
    description: 'Địa chỉ giao hàng đầy đủ',
    example: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    required: true,
    minLength: 10,
  })
  @IsString({ message: 'Địa chỉ giao hàng phải là chuỗi' })
  @MinLength(10, { message: 'Địa chỉ giao hàng phải có ít nhất 10 ký tự' })
  shippingAddress: string;

  @ApiProperty({
    description: 'Tên người nhận hàng',
    example: 'Nguyễn Thị Hương',
    required: true,
    minLength: 2,
  })
  @IsString({ message: 'Tên người nhận phải là chuỗi' })
  @MinLength(2, { message: 'Tên người nhận phải có ít nhất 2 ký tự' })
  recipientName: string;

  @ApiProperty({
    description: 'Số điện thoại người nhận (10-11 số)',
    example: '0987654321',
    required: true,
  })
  @IsString({ message: 'SĐT người nhận phải là chuỗi' })
  recipientPhone: string;

  @ApiProperty({
    description: 'Danh sách sản phẩm trong đơn hàng',
    type: [CreateOrderDetailDto],
    examples: [
      {
        productId: '64f7b1234567890abcdef123',
        quantity: 1,
        priceAtPurchase: 45000000,
        discountApplied: 0,
      },
      {
        productId: '64f7b1234567890abcdef456',
        quantity: 2,
        priceAtPurchase: 2500000,
        discountApplied: 0,
      },
    ],
  })
  @IsArray({ message: 'Chi tiết đơn hàng phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDetailDto)
  orderDetails: CreateOrderDetailDto[];

  @ApiProperty({
    description: 'Phí vận chuyển (VND). Mặc định 30,000 VND nếu không truyền',
    example: 30000,
    minimum: 0,
    required: false,
    default: 30000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Phí vận chuyển phải là số' })
  @Min(0, { message: 'Phí vận chuyển phải lớn hơn hoặc bằng 0' })
  shippingFee?: number;

  @ApiProperty({
    description: 'Phương thức thanh toán',
    enum: PaymentMethod,
    examples: {
      cash: {
        summary: 'Thanh toán tiền mặt khi nhận hàng (COD)',
        value: 'cash',
      },
      payos: {
        summary: 'Thanh toán trực tuyến qua PayOS',
        value: 'payos',
      },
    },
    example: PaymentMethod.CASH,
  })
  @IsEnum(PaymentMethod, { message: 'Phương thức thanh toán không hợp lệ' })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Mã voucher giảm giá (nếu có)',
    examples: {
      percentage: {
        summary: 'Voucher giảm theo phần trăm',
        value: 'SALE10',
      },
      fixed: {
        summary: 'Voucher giảm số tiền cố định',
        value: 'WELCOME500K',
      },
      newCustomer: {
        summary: 'Voucher khách hàng mới',
        value: 'NEWCUSTOMER2024',
      },
    },
    example: 'WELCOME10',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Mã voucher phải là chuỗi' })
  voucherCode?: string;

  @ApiProperty({
    description: 'Ghi chú đặc biệt cho đơn hàng',
    examples: {
      deliveryTime: {
        summary: 'Yêu cầu về thời gian giao',
        value: 'Giao hàng buổi sáng 8-10h',
      },
      packaging: {
        summary: 'Yêu cầu về bao bì',
        value: 'Gói quà tặng với hộp sang trọng',
      },
      contact: {
        summary: 'Lưu ý liên hệ',
        value: 'Gọi trước 30 phút khi đến giao hàng',
      },
    },
    example: 'Giao hàng buổi chiều sau 2h, gọi trước khi đến',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  notes?: string;
}
