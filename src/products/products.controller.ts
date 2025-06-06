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
    schema: {
      type: 'object',
      properties: {
        products: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProductResponseDto' },
        },
        pagination: {
          type: 'object',
          properties: {
            current: { type: 'number' },
            total: { type: 'number' },
            pages: { type: 'number' },
            limit: { type: 'number' },
          },
        },
      },
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
    return this.productsService.findAll({
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
    type: [ProductResponseDto],
  })
  async getFeaturedProducts(
    @Query('limit') limit?: number,
  ): Promise<ProductResponseDto[]> {
    return this.productsService.getFeaturedProducts(limit);
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
    type: [ProductResponseDto],
  })
  async getLatestProducts(
    @Query('limit') limit?: number,
  ): Promise<ProductResponseDto[]> {
    return this.productsService.getLatestProducts(limit);
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
    name: 'q',
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
    schema: {
      type: 'object',
      properties: {
        products: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProductResponseDto' },
        },
        pagination: {
          type: 'object',
          properties: {
            current: { type: 'number' },
            total: { type: 'number' },
            pages: { type: 'number' },
            limit: { type: 'number' },
          },
        },
      },
    },
  })
  async searchProducts(
    @Query('q') query: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: 'price' | 'createdAt' | 'views',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.productsService.searchProducts(query, {
      page,
      limit,
      sortBy,
      sortOrder,
    });
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
    type: [ProductResponseDto],
  })
  @ApiResponse({ status: 400, description: 'ID danh mục không hợp lệ' })
  async getProductsByCategory(
    @Param('categoryId') categoryId: string,
    @Query('limit') limit?: number,
  ): Promise<ProductResponseDto[]> {
    return this.productsService.getProductsByCategory(categoryId, limit);
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
