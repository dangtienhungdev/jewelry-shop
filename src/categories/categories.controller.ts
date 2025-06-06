import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { CategoriesService } from './categories.service';
import {
  CategoryResponseDto,
  CategoryTreeDto,
  CategoryWithSubcategoriesDto,
} from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('📁 Categories - Quản lý danh mục')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Tạo danh mục mới',
    description: 'Tạo danh mục mới với tên duy nhất trong cùng danh mục cha',
  })
  @ApiCreatedResponse({
    description: 'Tạo danh mục thành công',
    type: CategoryResponseDto,
    example: {
      success: true,
      message: 'Tạo danh mục thành công',
      data: {
        _id: '60d5f484e1a2f5001f647abc',
        categoryName: 'Nhẫn Kim cương',
        description: 'Các loại nhẫn đính kim cương cao cấp',
        parentId: '60d5f484e1a2f5001f647def',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiBadRequestResponse({
    description: 'Dữ liệu đầu vào không hợp lệ',
    example: {
      success: false,
      message: 'Validation failed',
      errors: ['Tên danh mục phải từ 2-100 ký tự'],
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiConflictResponse({
    description: 'Tên danh mục đã tồn tại',
    example: {
      success: false,
      message: 'Tên danh mục đã tồn tại trong danh mục cha này',
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiBody({
    type: CreateCategoryDto,
    description: 'Thông tin danh mục mới',
    examples: {
      rootCategory: {
        summary: 'Danh mục gốc',
        value: {
          categoryName: 'Nhẫn',
          description: 'Các loại nhẫn trang sức',
          isActive: true,
        },
      },
      subcategory: {
        summary: 'Danh mục con',
        value: {
          categoryName: 'Nhẫn Kim cương',
          description: 'Các loại nhẫn đính kim cương cao cấp',
          parentId: '60d5f484e1a2f5001f647def',
          isActive: true,
        },
      },
    },
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách danh mục',
    description: 'Lấy danh sách danh mục với phân trang và bộ lọc',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Số trang (bắt đầu từ 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số bản ghi trên mỗi trang',
    example: 10,
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Lọc theo trạng thái hoạt động',
    example: true,
  })
  @ApiQuery({
    name: 'parentId',
    required: false,
    type: String,
    description: 'Lọc theo danh mục cha (null để lấy danh mục gốc)',
    example: '60d5f484e1a2f5001f647def',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Tìm kiếm theo tên danh mục',
  })
  @ApiOkResponse({
    description: 'Lấy danh sách thành công',
    example: {
      success: true,
      message: 'Lấy danh sách danh mục thành công',
      data: {
        items: [
          {
            _id: '60d5f484e1a2f5001f647abc',
            categoryName: 'Nhẫn Kim cương',
            description: 'Các loại nhẫn đính kim cương cao cấp',
            parentId: '60d5f484e1a2f5001f647def',
            isActive: true,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        total: 50,
        page: 1,
        limit: 10,
        totalPages: 5,
        hasNextPage: true,
        hasPrevPage: false,
      },
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('isActive') isActive?: boolean,
    @Query('parentId') parentId?: string,
    @Query('search') search?: string,
  ) {
    return this.categoriesService.findAll({
      page,
      limit,
      isActive,
      parentId,
      search,
    });
  }

  @Get('tree')
  @ApiOperation({
    summary: 'Lấy cây danh mục',
    description: 'Lấy toàn bộ cây danh mục theo cấu trúc phân cấp',
  })
  @ApiOkResponse({
    description: 'Lấy cây danh mục thành công',
    type: [CategoryTreeDto],
  })
  async getCategoryTree(): Promise<CategoryTreeDto[]> {
    return this.categoriesService.getTree();
  }

  @Get('root')
  @ApiOperation({
    summary: 'Lấy danh mục gốc',
    description: 'Lấy tất cả danh mục gốc (không có danh mục cha)',
  })
  @ApiOkResponse({
    description: 'Lấy danh mục gốc thành công',
    type: [CategoryResponseDto],
    example: {
      success: true,
      message: 'Lấy danh mục gốc thành công',
      data: [
        {
          _id: '60d5f484e1a2f5001f647abc',
          categoryName: 'Nhẫn',
          description: 'Các loại nhẫn trang sức',
          parentId: null,
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  async getRootCategories(): Promise<CategoryResponseDto[]> {
    return this.categoriesService.getRootCategories();
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Lấy thống kê danh mục',
    description: 'Lấy thống kê tổng quan về danh mục',
  })
  @ApiOkResponse({
    description: 'Lấy thống kê thành công',
  })
  // @ApiBearerAuth() // Uncomment khi có authentication
  // @UseGuards(AuthGuard) // Uncomment khi có authentication
  async getCategoryStats() {
    return this.categoriesService.getCategoryStats();
  }

  @Get('search')
  @ApiOperation({
    summary: 'Tìm kiếm danh mục',
    description: 'Tìm kiếm danh mục theo tên hoặc mô tả',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Từ khóa tìm kiếm',
  })
  @ApiOkResponse({
    description: 'Tìm kiếm thành công',
    type: [CategoryResponseDto],
  })
  async searchCategories(
    @Query('q') query: string,
  ): Promise<CategoryResponseDto[]> {
    return this.categoriesService.searchCategories(query);
  }

  @Get(':id/subcategories')
  @ApiOperation({
    summary: 'Lấy danh mục con',
    description: 'Lấy tất cả danh mục con của một danh mục',
  })
  @ApiParam({
    name: 'id',
    description: 'ID danh mục cha',
    example: '60d5f484e1a2f5001f647def',
  })
  @ApiOkResponse({
    description: 'Lấy danh mục con thành công',
    type: [CategoryResponseDto],
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy danh mục cha',
  })
  async getSubcategories(
    @Param('id') id: string,
  ): Promise<CategoryResponseDto[]> {
    return this.categoriesService.getSubcategories(id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết danh mục',
    description: 'Lấy thông tin chi tiết của một danh mục',
  })
  @ApiParam({
    name: 'id',
    description: 'ID danh mục',
    example: '60d5f484e1a2f5001f647abc',
  })
  @ApiOkResponse({
    description: 'Lấy thông tin thành công',
    type: CategoryWithSubcategoriesDto,
    example: {
      success: true,
      message: 'Lấy thông tin danh mục thành công',
      data: {
        _id: '60d5f484e1a2f5001f647abc',
        categoryName: 'Nhẫn Kim cương',
        description: 'Các loại nhẫn đính kim cương cao cấp',
        parentId: '60d5f484e1a2f5001f647def',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        parent: {
          _id: '60d5f484e1a2f5001f647def',
          categoryName: 'Nhẫn',
          description: 'Các loại nhẫn trang sức',
          parentId: null,
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        subcategories: [],
      },
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy danh mục',
  })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật danh mục',
    description: 'Cập nhật thông tin danh mục',
  })
  @ApiParam({
    name: 'id',
    description: 'ID danh mục',
    example: '60d5f484e1a2f5001f647abc',
  })
  @ApiOkResponse({
    description: 'Cập nhật thành công',
    type: CategoryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Dữ liệu không hợp lệ',
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy danh mục',
  })
  @ApiConflictResponse({
    description: 'Tên danh mục đã tồn tại',
  })
  // @ApiBearerAuth() // Uncomment khi có authentication
  // @UseGuards(AuthGuard) // Uncomment khi có authentication
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({
    summary: 'Kích hoạt/vô hiệu hóa danh mục',
    description: 'Thay đổi trạng thái hoạt động của danh mục',
  })
  @ApiParam({
    name: 'id',
    description: 'ID danh mục',
    example: '60d5f484e1a2f5001f647abc',
  })
  @ApiOkResponse({
    description: 'Thay đổi trạng thái thành công',
    type: CategoryResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy danh mục',
  })
  // @ApiBearerAuth() // Uncomment khi có authentication
  // @UseGuards(AuthGuard) // Uncomment khi có authentication
  async toggleActive(@Param('id') id: string): Promise<CategoryResponseDto> {
    return this.categoriesService.toggleActive(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xóa danh mục',
    description: 'Xóa danh mục (không có danh mục con và sản phẩm)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID danh mục',
    example: '60d5f484e1a2f5001f647abc',
  })
  @ApiOkResponse({
    description: 'Xóa thành công',
  })
  @ApiBadRequestResponse({
    description: 'Không thể xóa danh mục có danh mục con hoặc sản phẩm',
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy danh mục',
  })
  // @ApiBearerAuth() // Uncomment khi có authentication
  // @UseGuards(AuthGuard) // Uncomment khi có authentication
  async remove(@Param('id') id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
