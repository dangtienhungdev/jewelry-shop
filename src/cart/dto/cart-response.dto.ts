import { ApiProperty } from '@nestjs/swagger';

export class CartItemDto {
  @ApiProperty({
    description: 'Thông tin sản phẩm',
    type: 'object',
    properties: {
      id: { type: 'string', example: '60d5f484e1a2f5001f647product' },
      productName: { type: 'string', example: 'Nhẫn Kim cương Solitaire' },
      price: { type: 'number', example: 50000000 },
      discountedPrice: { type: 'number', example: 45000000 },
      images: { type: 'array', items: { type: 'string' } },
      material: { type: 'string', example: 'Vàng 18k' },
      stockQuantity: { type: 'number', example: 10 },
    },
  })
  product: {
    id: string;
    productName: string;
    price: number;
    discountedPrice?: number;
    images?: string[];
    material: string;
    stockQuantity: number;
  };

  @ApiProperty({
    description: 'Số lượng sản phẩm trong giỏ hàng',
    example: 2,
  })
  quantity: number;

  @ApiProperty({
    description: 'Giá tại thời điểm thêm vào giỏ',
    example: 50000000,
  })
  price: number;

  @ApiProperty({
    description: 'Giá giảm tại thời điểm thêm vào giỏ',
    example: 45000000,
  })
  discountedPrice?: number;

  @ApiProperty({
    description: 'Giá hiệu lực (giá sau giảm hoặc giá gốc)',
    example: 45000000,
  })
  effectivePrice: number;

  @ApiProperty({
    description: 'Tổng tiền cho item này',
    example: 90000000,
  })
  subtotal: number;

  @ApiProperty({
    description: 'Thời gian thêm vào giỏ hàng',
    example: '2024-01-01T00:00:00.000Z',
  })
  addedAt: Date;
}

export class CartResponseDto {
  @ApiProperty({
    description: 'ID giỏ hàng',
    example: '60d5f484e1a2f5001f647cart',
  })
  id: string;

  @ApiProperty({
    description: 'ID khách hàng',
    example: '60d5f484e1a2f5001f647customer',
  })
  customerId: string;

  @ApiProperty({
    description: 'Danh sách sản phẩm trong giỏ hàng',
    type: [CartItemDto],
  })
  items: CartItemDto[];

  @ApiProperty({
    description: 'Tổng số lượng sản phẩm',
    example: 2,
  })
  totalItems: number;

  @ApiProperty({
    description: 'Tổng tiền',
    example: 90000000,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Thời gian tạo giỏ hàng',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật cuối cùng',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
