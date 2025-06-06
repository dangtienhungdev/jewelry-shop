import { ApiProperty } from '@nestjs/swagger';

export class CategoryTreeDto {
  @ApiProperty({
    description: 'ID danh mục (MongoDB ObjectId)',
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
    description: 'Danh sách danh mục con',
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
