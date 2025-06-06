import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'ID danh mục',
    example: '60d5f484e1a2f5001f647abc',
  })
  id: string;

  @ApiProperty({
    description: 'Tên danh mục',
    example: 'Nhẫn Kim cương',
  })
  categoryName: string;

  @ApiProperty({
    description: 'Mô tả danh mục',
    example: 'Các loại nhẫn đính kim cương cao cấp',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'ID danh mục cha',
    example: '60d5f484e1a2f5001f647def',
    required: false,
  })
  parentId?: string;

  @ApiProperty({
    description: 'Thông tin danh mục cha',
    required: false,
  })
  parent?: {
    id: string;
    categoryName: string;
    description?: string;
  };

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Thời gian tạo danh mục',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật cuối',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class CategoryWithSubcategoriesDto extends CategoryResponseDto {
  @ApiProperty({
    description: 'Danh sách danh mục con',
    type: [CategoryResponseDto],
    required: false,
  })
  subcategories?: CategoryResponseDto[];

  @ApiProperty({
    description: 'Thông tin danh mục cha',
    type: CategoryResponseDto,
    required: false,
  })
  parent?: CategoryResponseDto;
}

export class CategoryTreeDto {
  @ApiProperty({
    description: 'ID danh mục',
    example: '60d5f484e1a2f5001f647abc',
  })
  id: string;

  @ApiProperty({
    description: 'Tên danh mục',
    example: 'Nhẫn',
  })
  categoryName: string;

  @ApiProperty({
    description: 'Mô tả danh mục',
    example: 'Các loại nhẫn trang sức',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'ID danh mục cha',
    example: '60d5f484e1a2f5001f647def',
    required: false,
  })
  parentId?: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Số lượng sản phẩm trong danh mục',
    example: 25,
  })
  productCount: number;

  @ApiProperty({
    description: 'Danh sách danh mục con (đệ quy)',
    type: [CategoryTreeDto],
    required: false,
  })
  children?: CategoryTreeDto[];

  @ApiProperty({
    description: 'Thời gian tạo danh mục',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật cuối cùng',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class ApiResponseDto<T> {
  @ApiProperty({
    description: 'Trạng thái thành công',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Thông báo',
    example: 'Thao tác thành công',
  })
  message: string;

  @ApiProperty({
    description: 'Dữ liệu trả về',
  })
  data?: T;

  @ApiProperty({
    description: 'Thời gian phản hồi',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: string;
}

export class PaginationResponseDto<T> {
  @ApiProperty({
    description: 'Danh sách dữ liệu',
    isArray: true,
  })
  items: T[];

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
}
