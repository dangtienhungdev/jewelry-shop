import { ApiProperty } from '@nestjs/swagger';
import { DiscountType } from '../../vouchers/schemas/voucher.schema';
import { OrderStatus } from '../../common/enums/order-status.enum';

export class OrderDetailResponseDto {
  @ApiProperty({
    description: 'ID sản phẩm',
    example: '64f7b1234567890abcdef123',
  })
  productId: string;

  @ApiProperty({ description: 'Tên sản phẩm', example: 'Nhẫn kim cương' })
  productName: string;

  @ApiProperty({
    description: 'Hình ảnh sản phẩm',
    example: 'https://example.com/image.jpg',
  })
  productImage?: string;

  @ApiProperty({ description: 'Số lượng', example: 2 })
  quantity: number;

  @ApiProperty({ description: 'Giá tại thời điểm mua', example: 50000000 })
  priceAtPurchase: number;

  @ApiProperty({ description: 'Giảm giá áp dụng', example: 0 })
  discountApplied: number;

  @ApiProperty({ description: 'Tổng tiền sản phẩm', example: 100000000 })
  subtotal: number;
}

export class AppliedDiscountResponseDto {
  @ApiProperty({
    description: 'ID voucher',
    example: '64f7b1234567890abcdef456',
  })
  discountId: string;

  @ApiProperty({ description: 'Mã voucher', example: 'WELCOME10' })
  discountCode: string;

  @ApiProperty({ description: 'Tên voucher', example: 'Giảm giá chào mừng' })
  discountName: string;

  @ApiProperty({ description: 'Loại giảm giá', enum: DiscountType })
  discountType: DiscountType;

  @ApiProperty({ description: 'Số tiền giảm thực tế', example: 100000 })
  discountAmount: number;
}

export class CustomerResponseDto {
  @ApiProperty({
    description: 'ID khách hàng',
    example: '64f7b1234567890abcdef012',
  })
  _id: string;

  @ApiProperty({ description: 'Tên đầy đủ', example: 'Nguyễn Văn A' })
  fullName: string;

  @ApiProperty({ description: 'Email', example: 'nguyenvana@email.com' })
  email: string;

  @ApiProperty({ description: 'Số điện thoại', example: '0987654321' })
  phone: string;
}

export class AdminResponseDto {
  @ApiProperty({ description: 'ID admin', example: '64f7b1234567890abcdef345' })
  _id: string;

  @ApiProperty({ description: 'Tên đăng nhập', example: 'admin01' })
  username: string;

  @ApiProperty({ description: 'Email', example: 'admin@jewelry.com' })
  email: string;
}

export class OrderResponseDto {
  @ApiProperty({
    description: 'ID đơn hàng',
    example: '64f7b1234567890abcdef789',
  })
  _id: string;

  @ApiProperty({ description: 'Mã đơn hàng', example: 'ORD-20240115-001' })
  orderCode: string;

  @ApiProperty({
    description: 'Thông tin khách hàng',
    type: CustomerResponseDto,
  })
  customer?: CustomerResponseDto;

  @ApiProperty({
    description: 'ID khách hàng',
    example: '64f7b1234567890abcdef012',
  })
  customerId: string;

  @ApiProperty({
    description: 'Ngày đặt hàng',
    example: '2024-01-15T10:30:00.000Z',
  })
  orderDate: Date;

  @ApiProperty({ description: 'Tổng tiền hàng', example: 100000000 })
  totalAmount: number;

  @ApiProperty({ description: 'Số tiền giảm giá', example: 10000000 })
  discountAmount: number;

  @ApiProperty({ description: 'Phí vận chuyển', example: 30000 })
  shippingFee: number;

  @ApiProperty({ description: 'Số tiền phải thanh toán', example: 90030000 })
  finalAmount: number;

  @ApiProperty({ description: 'Trạng thái đơn hàng', enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty({
    description: 'Địa chỉ giao hàng',
    example: '123 Nguyễn Huệ, Q1, HCM',
  })
  shippingAddress: string;

  @ApiProperty({ description: 'Tên người nhận', example: 'Nguyễn Văn A' })
  recipientName: string;

  @ApiProperty({ description: 'SĐT người nhận', example: '0987654321' })
  recipientPhone: string;

  @ApiProperty({ description: 'Thông tin admin xử lý', type: AdminResponseDto })
  processedByAdmin?: AdminResponseDto;

  @ApiProperty({
    description: 'Ghi chú đơn hàng',
    example: 'Giao hàng buổi sáng',
  })
  notes?: string;

  @ApiProperty({
    description: 'Chi tiết đơn hàng',
    type: [OrderDetailResponseDto],
  })
  orderDetails: OrderDetailResponseDto[];

  @ApiProperty({
    description: 'Voucher đã áp dụng',
    type: [AppliedDiscountResponseDto],
  })
  appliedDiscounts: AppliedDiscountResponseDto[];

  @ApiProperty({ description: 'Ngày tạo', example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({
    description: 'Ngày cập nhật',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}
