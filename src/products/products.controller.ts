import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo sản phẩm mới' })
  @ApiResponse({
    status: 201,
    description: 'Sản phẩm được tạo thành công',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Danh mục không tồn tại' })
  // @ApiBearerAuth() // Uncomment khi có authentication
  // @UseGuards(AuthGuard) // Uncomment khi có authentication
  async create(
    @Body() createProductDto: CreateProductDto,
    // @CurrentUser() user: any, // Uncomment khi có authentication
  ): Promise<ProductResponseDto> {
    // return this.productsService.create(createProductDto, user?.id);
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm với phân trang và lọc' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Số trang',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng sản phẩm mỗi trang',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: String,
    description: 'ID danh mục',
  })
  @ApiQuery({
    name: 'isFeatured',
    required: false,
    type: Boolean,
    description: 'Sản phẩm nổi bật',
  })
  @ApiQuery({
    name: 'material',
    required: false,
    type: String,
    description: 'Chất liệu',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Giá tối thiểu',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Giá tối đa',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Từ khóa tìm kiếm',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['price', 'createdAt', 'views', 'productName'],
    description: 'Trường sắp xếp',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Thứ tự sắp xếp',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách sản phẩm thành công',
    example: {
      success: true,
      message: 'Lấy danh sách sản phẩm thành công',
      data: {
        items: [
          {
            _id: '60d5f484e1a2f5001f647abc',
            productName: 'Nhẫn Kim cương solitaire',
            description: 'Nhẫn kim cương solitaire cao cấp',
            price: 50000000,
            discountedPrice: 45000000,
            stockQuantity: 10,
            material: 'Vàng 18K',
            weight: 3.5,
            dimensions: '6mm',
            images: ['image1.jpg', 'image2.jpg'],
            isFeatured: true,
            views: 150,
            categoryId: {
              _id: '60d5f484e1a2f5001f647def',
              categoryName: 'Nhẫn',
              description: 'Các loại nhẫn trang sức',
            },
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
    @Query('categoryId') categoryId?: string,
    @Query('isFeatured') isFeatured?: boolean,
    @Query('material') material?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'price' | 'createdAt' | 'views' | 'productName',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const result = await this.productsService.findAll({
      page,
      limit,
      categoryId,
      isFeatured,
      material,
      minPrice,
      maxPrice,
      search,
      sortBy,
      sortOrder,
    });

    return {
      success: true,
      message: 'Lấy danh sách sản phẩm thành công',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('featured')
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm nổi bật' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng sản phẩm',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy sản phẩm nổi bật thành công',
    example: {
      success: true,
      message: 'Lấy danh sách sản phẩm nổi bật thành công',
      data: {
        items: [
          {
            _id: '60d5f484e1a2f5001f647abc',
            productName: 'Nhẫn Kim cương solitaire nổi bật',
            description: 'Nhẫn kim cương solitaire cao cấp',
            price: 50000000,
            discountedPrice: 45000000,
            stockQuantity: 10,
            material: 'Vàng 18K',
            weight: 3.5,
            dimensions: '6mm',
            images: ['image1.jpg', 'image2.jpg'],
            isFeatured: true,
            views: 150,
            categoryId: {
              _id: '60d5f484e1a2f5001f647def',
              categoryName: 'Nhẫn',
              description: 'Các loại nhẫn trang sức',
            },
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        total: 15,
        limit: 10,
      },
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  async getFeaturedProducts(@Query('limit') limit?: number) {
    const products = await this.productsService.getFeaturedProducts(limit);

    return {
      success: true,
      message: 'Lấy danh sách sản phẩm nổi bật thành công',
      data: {
        items: products,
        total: products.length,
        limit: limit || 10,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('latest')
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm mới nhất' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng sản phẩm',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy sản phẩm mới nhất thành công',
    example: {
      success: true,
      message: 'Lấy danh sách sản phẩm mới nhất thành công',
      data: {
        items: [
          {
            _id: '60d5f484e1a2f5001f647abc',
            productName: 'Nhẫn Kim cương mới nhất',
            description: 'Nhẫn kim cương thiết kế mới',
            price: 40000000,
            discountedPrice: null,
            stockQuantity: 15,
            material: 'Vàng 18K',
            weight: 3.2,
            dimensions: '6mm',
            images: ['latest1.jpg', 'latest2.jpg'],
            isFeatured: false,
            views: 50,
            categoryId: {
              _id: '60d5f484e1a2f5001f647def',
              categoryName: 'Nhẫn',
              description: 'Các loại nhẫn trang sức',
            },
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        total: 12,
        limit: 10,
      },
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  async getLatestProducts(@Query('limit') limit?: number) {
    const products = await this.productsService.getLatestProducts(limit);

    return {
      success: true,
      message: 'Lấy danh sách sản phẩm mới nhất thành công',
      data: {
        items: products,
        total: products.length,
        limit: limit || 10,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê thành công',
    schema: {
      type: 'object',
      properties: {
        totalProducts: { type: 'number' },
        totalInStock: { type: 'number' },
        totalOutOfStock: { type: 'number' },
        featuredProducts: { type: 'number' },
        averagePrice: { type: 'number' },
        topCategories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              categoryName: { type: 'string' },
              productCount: { type: 'number' },
            },
          },
        },
      },
    },
  })
  // @ApiBearerAuth() // Uncomment khi có authentication
  // @UseGuards(AuthGuard) // Uncomment khi có authentication
  async getProductStats() {
    return this.productsService.getProductStats();
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm sản phẩm' })
  @ApiQuery({
    name: 'search',
    required: true,
    type: String,
    description: 'Từ khóa tìm kiếm',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Số trang',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng sản phẩm mỗi trang',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['price', 'createdAt', 'views'],
    description: 'Trường sắp xếp',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Thứ tự sắp xếp',
  })
  @ApiResponse({
    status: 200,
    description: 'Tìm kiếm thành công',
    example: {
      success: true,
      message: 'Tìm kiếm sản phẩm thành công',
      data: {
        items: [
          {
            _id: '60d5f484e1a2f5001f647abc',
            productName: 'Nhẫn Kim cương solitaire',
            description: 'Nhẫn kim cương solitaire cao cấp',
            price: 50000000,
            discountedPrice: 45000000,
            stockQuantity: 10,
            material: 'Vàng 18K',
            weight: 3.5,
            dimensions: '6mm',
            images: ['image1.jpg', 'image2.jpg'],
            isFeatured: true,
            views: 150,
            categoryId: {
              _id: '60d5f484e1a2f5001f647def',
              categoryName: 'Nhẫn',
              description: 'Các loại nhẫn trang sức',
            },
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        total: 25,
        page: 1,
        limit: 10,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: false,
      },
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Từ khóa tìm kiếm không được để trống',
  })
  async searchProducts(
    @Query('search') query: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: 'price' | 'createdAt' | 'views',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    // Kiểm tra query parameter
    if (!query || query.trim().length === 0) {
      return {
        success: false,
        message: 'Từ khóa tìm kiếm không được để trống',
        data: {
          items: [],
          total: 0,
          page: page || 1,
          limit: limit || 10,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
        timestamp: new Date().toISOString(),
      };
    }

    const result = await this.productsService.searchProducts(query, {
      page,
      limit,
      sortBy,
      sortOrder,
    });

    return {
      success: true,
      message: 'Tìm kiếm sản phẩm thành công',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Lấy sản phẩm theo danh mục' })
  @ApiParam({ name: 'categoryId', description: 'ID danh mục' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng sản phẩm',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy sản phẩm theo danh mục thành công',
    example: {
      success: true,
      message: 'Lấy sản phẩm theo danh mục thành công',
      data: {
        items: [
          {
            _id: '60d5f484e1a2f5001f647abc',
            productName: 'Nhẫn Kim cương trong danh mục',
            description: 'Nhẫn kim cương thuộc danh mục cụ thể',
            price: 35000000,
            discountedPrice: null,
            stockQuantity: 8,
            material: 'Vàng 18K',
            weight: 3.0,
            dimensions: '6mm',
            images: ['category1.jpg', 'category2.jpg'],
            isFeatured: false,
            views: 75,
            categoryId: {
              _id: '60d5f484e1a2f5001f647def',
              categoryName: 'Nhẫn',
              description: 'Các loại nhẫn trang sức',
            },
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        total: 8,
        limit: 10,
      },
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiResponse({ status: 400, description: 'ID danh mục không hợp lệ' })
  async getProductsByCategory(
    @Param('categoryId') categoryId: string,
    @Query('limit') limit?: number,
  ) {
    const products = await this.productsService.getProductsByCategory(
      categoryId,
      limit,
    );

    return {
      success: true,
      message: 'Lấy sản phẩm theo danh mục thành công',
      data: {
        items: products,
        total: products.length,
        limit: limit || 10,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id/related')
  @ApiOperation({
    summary: 'Lấy danh sách sản phẩm liên quan trong cùng danh mục',
  })
  @ApiParam({ name: 'id', description: 'ID sản phẩm' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng sản phẩm liên quan (mặc định: 8)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy sản phẩm liên quan thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProductResponseDto' },
            },
            total: { type: 'number' },
            limit: { type: 'number' },
          },
        },
        timestamp: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'ID sản phẩm không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  async getRelatedProducts(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    const products = await this.productsService.getRelatedProducts(id, limit);

    return {
      success: true,
      message: 'Lấy sản phẩm liên quan thành công',
      data: {
        items: products,
        total: products.length,
        limit: limit || 8,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết sản phẩm' })
  @ApiParam({ name: 'id', description: 'ID sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin sản phẩm thành công',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'ID sản phẩm không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin sản phẩm' })
  @ApiParam({ name: 'id', description: 'ID sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật sản phẩm thành công',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  // @ApiBearerAuth() // Uncomment khi có authentication
  // @UseGuards(AuthGuard) // Uncomment khi có authentication
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch(':id/stock')
  @ApiOperation({ summary: 'Cập nhật số lượng tồn kho' })
  @ApiParam({ name: 'id', description: 'ID sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật tồn kho thành công',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Số lượng không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  // @ApiBearerAuth() // Uncomment khi có authentication
  // @UseGuards(AuthGuard) // Uncomment khi có authentication
  async updateStock(
    @Param('id') id: string,
    @Body('quantity', ParseIntPipe) quantity: number,
  ): Promise<ProductResponseDto> {
    return this.productsService.updateStock(id, quantity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa sản phẩm' })
  @ApiParam({ name: 'id', description: 'ID sản phẩm' })
  @ApiResponse({ status: 204, description: 'Xóa sản phẩm thành công' })
  @ApiResponse({ status: 400, description: 'ID sản phẩm không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  // @ApiBearerAuth() // Uncomment khi có authentication
  // @UseGuards(AuthGuard) // Uncomment khi có authentication
  async remove(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}
