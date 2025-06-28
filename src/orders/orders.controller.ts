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
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrderStatus } from '../common/enums/order-status.enum';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo đơn hàng mới',
    description: `
## Tạo đơn hàng cho khách hàng

### Các bước thực hiện:
1. Validate thông tin khách hàng và sản phẩm
2. Tính toán tổng tiền từ orderDetails
3. Áp dụng voucher (nếu có)
4. Tạo đơn hàng với trạng thái 'pending'
5. Xử lý thanh toán theo phương thức đã chọn

### Lưu ý:
- **CASH**: Thanh toán khi nhận hàng (COD)
- **PAYOS**: Tạo link thanh toán online, trả về paymentUrl
- Voucher sẽ được validate và áp dụng tự động
- Phí ship mặc định là 30,000 VND nếu không truyền
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Đơn hàng được tạo thành công',
    schema: {
      type: 'object',
      properties: {
        order: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f7b1234567890abcdef789' },
            orderCode: { type: 'string', example: 'ORD20240628001' },
            customerId: { type: 'string', example: '64f7b1234567890abcdef012' },
            orderDate: { type: 'string', example: '2024-06-28T15:30:00.000Z' },
            totalAmount: { type: 'number', example: 45000000 },
            discountAmount: { type: 'number', example: 4500000 },
            finalAmount: { type: 'number', example: 40530000 },
            shippingFee: { type: 'number', example: 30000 },
            status: { type: 'string', example: 'pending' },
            shippingAddress: {
              type: 'string',
              example: '123 Nguyễn Huệ, Q1, HCM',
            },
            recipientName: { type: 'string', example: 'Nguyễn Văn A' },
            recipientPhone: { type: 'string', example: '0987654321' },
            orderDetails: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: {
                    type: 'string',
                    example: '64f7b1234567890abcdef123',
                  },
                  quantity: { type: 'number', example: 1 },
                  priceAtPurchase: { type: 'number', example: 45000000 },
                  discountApplied: { type: 'number', example: 0 },
                },
              },
            },
            appliedDiscounts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  discountId: {
                    type: 'string',
                    example: '64f7b1234567890abcdef456',
                  },
                  discountAmount: { type: 'number', example: 4500000 },
                },
              },
            },
          },
        },
        paymentUrl: {
          type: 'string',
          description:
            'Link thanh toán PayOS (chỉ có khi paymentMethod = payos)',
          example: 'https://pay.payos.vn/web/4b5f6b7c8d9e0f1a2b3c4d5e6f7a8b9c',
        },
        message: {
          type: 'string',
          description: 'Thông báo kết quả',
          example: 'Đơn hàng đã được tạo thành công. Thanh toán khi nhận hàng.',
        },
      },
      examples: {
        cashPayment: {
          summary: 'Thanh toán tiền mặt (COD)',
          value: {
            order: {
              _id: '64f7b1234567890abcdef789',
              orderCode: 'ORD20240628001',
              customerId: '64f7b1234567890abcdef012',
              totalAmount: 45000000,
              discountAmount: 4500000,
              finalAmount: 40530000,
              status: 'pending',
            },
            paymentUrl: null,
            message:
              'Đơn hàng đã được tạo thành công. Thanh toán khi nhận hàng.',
          },
        },
        payosPayment: {
          summary: 'Thanh toán PayOS',
          value: {
            order: {
              _id: '64f7b1234567890abcdef789',
              orderCode: 'ORD20240628001',
              customerId: '64f7b1234567890abcdef012',
              totalAmount: 45000000,
              discountAmount: 4500000,
              finalAmount: 40530000,
              status: 'pending',
            },
            paymentUrl:
              'https://pay.payos.vn/web/4b5f6b7c8d9e0f1a2b3c4d5e6f7a8b9c',
            message:
              'Đơn hàng đã được tạo. Vui lòng thanh toán qua link PayOS.',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc voucher không hợp lệ',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'Voucher đã hết hạn hoặc Số lượng phải lớn hơn 0',
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy khách hàng hoặc voucher',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Không tìm thấy mã voucher' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async create(@Body() createOrderDto: CreateOrderDto) {
    return await this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng' })
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
    description: 'Số lượng mỗi trang',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: OrderStatus,
    description: 'Trạng thái đơn hàng',
  })
  @ApiQuery({
    name: 'customerId',
    required: false,
    type: String,
    description: 'ID khách hàng',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Tìm kiếm theo mã đơn hàng, tên, SĐT',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Ngày bắt đầu (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Ngày kết thúc (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Sắp xếp theo trường',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Thứ tự sắp xếp',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách đơn hàng',
    schema: {
      type: 'object',
      properties: {
        orders: {
          type: 'array',
          items: { $ref: '#/components/schemas/OrderResponseDto' },
        },
        total: { type: 'number', description: 'Tổng số đơn hàng' },
      },
    },
  })
  async findAll(@Query() query: any) {
    return await this.ordersService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Thống kê đơn hàng' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Ngày bắt đầu',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Ngày kết thúc',
  })
  @ApiResponse({
    status: 200,
    description: 'Thống kê đơn hàng',
    schema: {
      type: 'object',
      properties: {
        totalOrders: { type: 'number' },
        totalRevenue: { type: 'number' },
        statusBreakdown: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              count: { type: 'number' },
              totalAmount: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getStats(@Query() query: any) {
    return await this.ordersService.getOrderStats(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết đơn hàng' })
  @ApiParam({ name: 'id', type: String, description: 'ID đơn hàng' })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết đơn hàng',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  async findOne(@Param('id') id: string) {
    return await this.ordersService.findOne(id);
  }

  @Get(':id/payments')
  @ApiOperation({ summary: 'Lấy lịch sử thanh toán của đơn hàng' })
  @ApiParam({ name: 'id', type: String, description: 'ID đơn hàng' })
  @ApiResponse({
    status: 200,
    description: 'Lịch sử thanh toán',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          paymentMethod: { type: 'string' },
          amount: { type: 'number' },
          status: { type: 'string' },
          transactionCode: { type: 'string' },
          createdAt: { type: 'string' },
        },
      },
    },
  })
  async getOrderPayments(@Param('id') id: string) {
    return await this.ordersService.getOrderPayments(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật đơn hàng' })
  @ApiParam({ name: 'id', type: String, description: 'ID đơn hàng' })
  @ApiResponse({
    status: 200,
    description: 'Đơn hàng được cập nhật',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return await this.ordersService.update(id, updateOrderDto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Hủy đơn hàng' })
  @ApiParam({ name: 'id', type: String, description: 'ID đơn hàng' })
  @ApiResponse({
    status: 200,
    description: 'Đơn hàng đã được hủy',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Không thể hủy đơn hàng' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  async cancelOrder(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return await this.ordersService.cancelOrder(id, body.reason);
  }

  @Post('payos/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'PayOS Webhook - Xử lý callback thanh toán' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook data' })
  async handlePayOSWebhook(@Body() webhookData: any) {
    await this.ordersService.handlePayOSWebhook(webhookData);
    return { message: 'Webhook processed successfully' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa đơn hàng' })
  @ApiParam({ name: 'id', type: String, description: 'ID đơn hàng' })
  @ApiResponse({ status: 200, description: 'Đơn hàng đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn hàng' })
  async remove(@Param('id') id: string) {
    await this.ordersService.remove(id);
    return { message: 'Đơn hàng đã được xóa thành công' };
  }

  @Post('confirm-payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xác nhận thanh toán thành công',
    description: `
## Xác nhận thanh toán từ frontend callback

### Mục đích:
- Backup mechanism khi PayOS webhook bị delay hoặc miss
- Frontend có thể confirm payment ngay lập tức sau redirect
- Đảm bảo order được update trạng thái đúng thời điểm

### Flow:
1. User thanh toán thành công trên PayOS
2. PayOS redirect về frontend success page với params
3. Frontend gọi API này để confirm payment
4. Backend update order status = 'confirmed' và payment status = 'completed'

### Security:
- Chỉ accept PayOS payments
- Validate payment status trước khi update
- Optional: Cross-check với PayOS API
- Idempotent operation (có thể gọi nhiều lần)
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Xác nhận thanh toán thành công',
    schema: {
      type: 'object',
      properties: {
        order: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f7b1234567890abcdef789' },
            orderCode: { type: 'string', example: 'ORD20240628001' },
            status: { type: 'string', example: 'confirmed' },
            finalAmount: { type: 'number', example: 40530000 },
          },
        },
        payment: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f7b1234567890abcdef890' },
            status: { type: 'string', example: 'completed' },
            amount: { type: 'number', example: 40530000 },
            paymentDate: {
              type: 'string',
              example: '2024-06-28T16:30:00.000Z',
            },
          },
        },
        message: {
          type: 'string',
          example: 'Xác nhận thanh toán thành công',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Không thể xác nhận thanh toán',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'Chỉ có thể xác nhận thanh toán PayOS',
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy đơn hàng hoặc thanh toán',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: {
          type: 'string',
          example: 'Không tìm thấy đơn hàng',
        },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async confirmPayment(@Body() confirmPaymentDto: ConfirmPaymentDto) {
    return await this.ordersService.confirmPayment(confirmPaymentDto);
  }
}
