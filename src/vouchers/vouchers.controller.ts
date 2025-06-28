import {
  Body,
  Controller,
  Delete,
  Get,
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
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import {
  ValidateVoucherDto,
  VoucherResponseDto,
  VoucherValidationResponseDto,
} from './dto/voucher-response.dto';
import { DiscountType } from './schemas/voucher.schema';
import { VouchersService } from './vouchers.service';

@ApiTags('Vouchers')
@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo voucher mới' })
  @ApiResponse({
    status: 201,
    description: 'Voucher được tạo thành công',
    type: VoucherResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc mã voucher đã tồn tại',
  })
  async create(@Body() createVoucherDto: CreateVoucherDto) {
    return await this.vouchersService.create(createVoucherDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách voucher' })
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
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Trạng thái hoạt động',
  })
  @ApiQuery({
    name: 'discountType',
    required: false,
    enum: DiscountType,
    description: 'Loại giảm giá',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Tìm kiếm theo mã hoặc tên voucher',
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
    description: 'Danh sách voucher',
    schema: {
      type: 'object',
      properties: {
        vouchers: {
          type: 'array',
          items: { $ref: '#/components/schemas/VoucherResponseDto' },
        },
        total: { type: 'number', description: 'Tổng số voucher' },
      },
    },
  })
  async findAll(@Query() query: any) {
    return await this.vouchersService.findAll(query);
  }

  @Get('active')
  @ApiOperation({ summary: 'Lấy danh sách voucher đang hoạt động' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách voucher hoạt động',
    type: [VoucherResponseDto],
  })
  async getActiveVouchers() {
    return await this.vouchersService.getActiveVouchers();
  }

  @Post('validate')
  @ApiOperation({ summary: 'Kiểm tra tính hợp lệ của voucher' })
  @ApiResponse({
    status: 200,
    description: 'Kết quả kiểm tra voucher',
    type: VoucherValidationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async validateVoucher(@Body() validateVoucherDto: ValidateVoucherDto) {
    return await this.vouchersService.validateVoucher(validateVoucherDto);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Lấy voucher theo mã' })
  @ApiParam({ name: 'code', type: String, description: 'Mã voucher' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin voucher',
    type: VoucherResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy voucher' })
  async findByCode(@Param('code') code: string) {
    return await this.vouchersService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết voucher' })
  @ApiParam({ name: 'id', type: String, description: 'ID voucher' })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết voucher',
    type: VoucherResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy voucher' })
  async findOne(@Param('id') id: string) {
    return await this.vouchersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật voucher' })
  @ApiParam({ name: 'id', type: String, description: 'ID voucher' })
  @ApiResponse({
    status: 200,
    description: 'Voucher được cập nhật',
    type: VoucherResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy voucher' })
  async update(
    @Param('id') id: string,
    @Body() updateVoucherDto: UpdateVoucherDto,
  ) {
    return await this.vouchersService.update(id, updateVoucherDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa voucher' })
  @ApiParam({ name: 'id', type: String, description: 'ID voucher' })
  @ApiResponse({ status: 200, description: 'Voucher đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy voucher' })
  async remove(@Param('id') id: string) {
    await this.vouchersService.remove(id);
    return { message: 'Voucher đã được xóa thành công' };
  }
}
