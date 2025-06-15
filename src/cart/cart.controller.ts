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
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddItemCartDto } from './dto/add-item-cart.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateItemCartDto } from './dto/update-item-cart.dto';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo giỏ hàng mới' })
  @ApiResponse({
    status: 201,
    description: 'Tạo giỏ hàng thành công',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  // @ApiBearerAuth() // Uncomment khi có authentication
  // @UseGuards(AuthGuard) // Uncomment khi có authentication
  async create(@Body() createCartDto: CreateCartDto): Promise<CartResponseDto> {
    return this.cartService.create(createCartDto);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Lấy giỏ hàng của khách hàng' })
  @ApiParam({ name: 'customerId', description: 'ID khách hàng' })
  @ApiResponse({
    status: 200,
    description: 'Lấy giỏ hàng thành công',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giỏ hàng' })
  async findByCustomerId(
    @Param('customerId') customerId: string,
  ): Promise<CartResponseDto> {
    return this.cartService.findByCustomerId(customerId);
  }

  @Post('customer/:customerId/items')
  @ApiOperation({
    summary: 'Thêm sản phẩm vào giỏ hàng',
    description:
      'Thêm sản phẩm vào giỏ hàng. Nếu khách hàng chưa có giỏ hàng, hệ thống sẽ tự động tạo giỏ hàng mới.',
  })
  @ApiParam({ name: 'customerId', description: 'ID khách hàng' })
  @ApiResponse({
    status: 201,
    description:
      'Thêm sản phẩm vào giỏ hàng thành công (bao gồm tạo giỏ hàng mới nếu cần)',
    type: CartResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc không đủ tồn kho',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  async addItem(
    @Param('customerId') customerId: string,
    @Body() addItemDto: AddItemCartDto,
  ): Promise<CartResponseDto> {
    return this.cartService.addItem(customerId, addItemDto);
  }

  @Patch('customer/:customerId/items/:productId')
  @ApiOperation({ summary: 'Cập nhật số lượng sản phẩm trong giỏ hàng' })
  @ApiParam({ name: 'customerId', description: 'ID khách hàng' })
  @ApiParam({ name: 'productId', description: 'ID sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật số lượng thành công',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sản phẩm trong giỏ hàng',
  })
  async updateItem(
    @Param('customerId') customerId: string,
    @Param('productId') productId: string,
    @Body() updateItemDto: UpdateItemCartDto,
  ): Promise<CartResponseDto> {
    return this.cartService.updateItem(customerId, productId, updateItemDto);
  }

  @Delete('customer/:customerId/items/:productId')
  @ApiOperation({ summary: 'Xóa sản phẩm khỏi giỏ hàng' })
  @ApiParam({ name: 'customerId', description: 'ID khách hàng' })
  @ApiParam({ name: 'productId', description: 'ID sản phẩm' })
  @ApiResponse({
    status: 200,
    description: 'Xóa sản phẩm khỏi giỏ hàng thành công',
    type: CartResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sản phẩm trong giỏ hàng',
  })
  async removeItem(
    @Param('customerId') customerId: string,
    @Param('productId') productId: string,
  ): Promise<CartResponseDto> {
    return this.cartService.removeItem(customerId, productId);
  }

  @Delete('customer/:customerId/clear')
  @ApiOperation({ summary: 'Xóa toàn bộ sản phẩm trong giỏ hàng' })
  @ApiParam({ name: 'customerId', description: 'ID khách hàng' })
  @ApiResponse({
    status: 200,
    description: 'Xóa toàn bộ giỏ hàng thành công',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Đã xóa toàn bộ sản phẩm trong giỏ hàng',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giỏ hàng' })
  async clearCart(
    @Param('customerId') customerId: string,
  ): Promise<{ message: string }> {
    return this.cartService.clearCart(customerId);
  }

  // Admin endpoints

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả giỏ hàng (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách giỏ hàng thành công',
    type: [CartResponseDto],
  })
  // @ApiBearerAuth() // Uncomment khi có authentication
  // @UseGuards(AuthGuard, AdminGuard) // Uncomment khi có authentication
  async findAll(): Promise<CartResponseDto[]> {
    return this.cartService.findAll();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa giỏ hàng (Admin)' })
  @ApiParam({ name: 'id', description: 'ID giỏ hàng' })
  @ApiResponse({ status: 204, description: 'Xóa giỏ hàng thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giỏ hàng' })
  // @ApiBearerAuth() // Uncomment khi có authentication
  // @UseGuards(AuthGuard, AdminGuard) // Uncomment khi có authentication
  async remove(@Param('id') id: string): Promise<void> {
    return this.cartService.remove(id);
  }
}
