import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({
    description: 'ID sản phẩm',
    example: '60d5f484e1a2f5001f647abc',
  })
  id: string;

  @ApiProperty({
    description: 'Tên sản phẩm',
    example: 'Nhẫn Kim cương Solitaire 1 carat',
  })
  productName: string;

  @ApiProperty({
    description: 'Mô tả sản phẩm',
    example:
      'Nhẫn kim cương solitaire với viên kim cương 1 carat, thiết kế cổ điển sang trọng',
  })
  description?: string;

  @ApiProperty({
    description: 'Giá gốc (VNĐ)',
    example: 45000000,
  })
  price: number;

  @ApiProperty({
    description: 'Giá sau giảm (VNĐ)',
    example: 42000000,
  })
  discountedPrice?: number;

  @ApiProperty({
    description: 'Giá hiệu lực (VNĐ)',
    example: 42000000,
  })
  effectivePrice: number;

  @ApiProperty({
    description: 'Phần trăm giảm giá',
    example: 7,
  })
  discountPercentage: number;

  @ApiProperty({
    description: 'Trọng lượng (gram)',
    example: 3.5,
  })
  weight: number;

  @ApiProperty({
    description: 'Chất liệu',
    example: 'Vàng 18k',
  })
  material: string;

  @ApiProperty({
    description: 'Số lượng tồn kho',
    example: 5,
  })
  stockQuantity: number;

  @ApiProperty({
    description: 'ID danh mục',
    example: '60d5f484e1a2f5001f647def',
  })
  categoryId: string;

  @ApiProperty({
    description: 'Thông tin danh mục',
  })
  category?: {
    id: string;
    categoryName: string;
    description?: string;
  };

  @ApiProperty({
    description: 'ID admin tạo sản phẩm',
    example: '60d5f484e1a2f5001f647xyz',
  })
  createdBy?: string;

  @ApiProperty({
    description: 'Sản phẩm nổi bật',
    example: true,
  })
  isFeatured: boolean;

  @ApiProperty({
    description: 'Số lượt xem',
    example: 1250,
  })
  views: number;

  @ApiProperty({
    description: 'Danh sách URL hình ảnh',
    type: [String],
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
  })
  images?: string[];

  @ApiProperty({
    description: 'Danh sách giảm giá được áp dụng',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        discountId: { type: 'string' },
        appliedAt: { type: 'string' },
      },
    },
  })
  discounts?: Array<{
    discountId: string;
    appliedAt: Date;
  }>;

  @ApiProperty({
    description: 'Thời gian tạo',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật cuối',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class ProductWithCategoryDto extends ProductResponseDto {
  @ApiProperty({
    description: 'Thông tin danh mục',
    type: 'object',
    properties: {
      id: { type: 'string', example: '60d5f484e1a2f5001f647def' },
      categoryName: { type: 'string', example: 'Nhẫn Kim cương' },
      description: { type: 'string', example: 'Các loại nhẫn đính kim cương' },
    },
  })
  category?: {
    id: string;
    categoryName: string;
    description?: string;
  };
}

export class ProductSearchResponseDto {
  @ApiProperty({
    description: 'Danh sách sản phẩm',
    type: [ProductWithCategoryDto],
  })
  items: ProductWithCategoryDto[];

  @ApiProperty({
    description: 'Tổng số bản ghi',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Trang hiện tại',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Số bản ghi trên mỗi trang',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Tổng số trang',
    example: 10,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Có trang tiếp theo',
    example: true,
  })
  hasNextPage: boolean;

  @ApiProperty({
    description: 'Có trang trước đó',
    example: false,
  })
  hasPrevPage: boolean;

  @ApiProperty({
    description: 'Thông tin bộ lọc áp dụng',
  })
  filters?: {
    categoryId?: string;
    material?: string;
    minPrice?: number;
    maxPrice?: number;
    isFeatured?: boolean;
    inStock?: boolean;
    search?: string;
  };
}

export class ProductFilterDto {
  @ApiProperty({
    description: 'ID danh mục',
    example: '60d5f484e1a2f5001f647def',
  })
  categoryId?: string;

  @ApiProperty({
    description: 'Chất liệu',
    example: 'Vàng 18k',
    enum: [
      'Vàng 24k',
      'Vàng 18k',
      'Vàng 14k',
      'Bạc 925',
      'Bạc 999',
      'Kim cương',
      'Ngọc trai',
      'Đá quý',
      'Khác',
    ],
  })
  material?: string;

  @ApiProperty({
    description: 'Giá tối thiểu (VNĐ)',
    example: 1000000,
    minimum: 0,
  })
  minPrice?: number;

  @ApiProperty({
    description: 'Giá tối đa (VNĐ)',
    example: 100000000,
    minimum: 0,
  })
  maxPrice?: number;

  @ApiProperty({
    description: 'Chỉ hiển thị sản phẩm nổi bật',
    example: true,
  })
  isFeatured?: boolean;

  @ApiProperty({
    description: 'Chỉ hiển thị sản phẩm còn hàng',
    example: true,
  })
  inStock?: boolean;

  @ApiProperty({
    description: 'Từ khóa tìm kiếm (tìm trong tên và mô tả)',
    example: 'kim cương',
  })
  search?: string;

  @ApiProperty({
    description: 'Sắp xếp theo',
    example: 'createdAt',
    enum: ['createdAt', 'price', 'views', 'productName'],
  })
  sortBy?: 'createdAt' | 'price' | 'views' | 'productName';

  @ApiProperty({
    description: 'Thứ tự sắp xếp',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  sortOrder?: 'asc' | 'desc';

  @ApiProperty({
    description: 'Số trang (bắt đầu từ 1)',
    example: 1,
    minimum: 1,
  })
  page?: number;

  @ApiProperty({
    description: 'Số bản ghi trên mỗi trang',
    example: 10,
    minimum: 1,
    maximum: 50,
  })
  limit?: number;
}
