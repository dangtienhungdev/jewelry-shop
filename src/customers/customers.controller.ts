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
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CustomersService } from './customers.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import {
  CustomerResponseDto,
  LoginResponseDto,
} from './dto/customer-response.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('👥 Customers - Quản lý khách hàng')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Đăng ký khách hàng mới',
    description:
      'Tạo tài khoản khách hàng mới với email và số điện thoại duy nhất',
  })
  @ApiCreatedResponse({
    description: 'Đăng ký thành công',
    type: CustomerResponseDto,
    example: {
      success: true,
      message: 'Đăng ký thành công',
      data: {
        _id: '60d5f484e1a2f5001f647abc',
        fullName: 'Nguyễn Văn An',
        phone: '0987654321',
        email: 'nguyenvana@email.com',
        address: '123 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM',
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
      errors: [
        'Email không đúng định dạng',
        'Số điện thoại phải có 10-11 chữ số',
      ],
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiConflictResponse({
    description: 'Email hoặc số điện thoại đã tồn tại',
    example: {
      success: false,
      message: 'Email đã được sử dụng',
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiBody({
    type: CreateCustomerDto,
    description: 'Thông tin đăng ký khách hàng',
    examples: {
      customer1: {
        summary: 'Khách hàng có địa chỉ',
        value: {
          fullName: 'Nguyễn Văn An',
          phone: '0987654321',
          email: 'nguyenvana@email.com',
          password: 'password123',
          address: '123 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM',
        },
      },
      customer2: {
        summary: 'Khách hàng không có địa chỉ',
        value: {
          fullName: 'Trần Thị Bích',
          phone: '0976543210',
          email: 'tranthibich@email.com',
          password: 'mypassword456',
        },
      },
    },
  })
  async register(@Body() createCustomerDto: CreateCustomerDto) {
    const customer = await this.customersService.register(createCustomerDto);
    return {
      success: true,
      message: 'Đăng ký thành công',
      data: customer,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng nhập khách hàng',
    description: 'Xác thực thông tin đăng nhập và trả về JWT tokens',
  })
  @ApiOkResponse({
    description: 'Đăng nhập thành công',
    type: LoginResponseDto,
    example: {
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        customer: {
          _id: '60d5f484e1a2f5001f647abc',
          fullName: 'Nguyễn Văn An',
          phone: '0987654321',
          email: 'nguyenvana@email.com',
          address: '123 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: 86400,
      },
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Thông tin đăng nhập không đúng',
    example: {
      success: false,
      message: 'Email hoặc mật khẩu không đúng',
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiBody({
    type: LoginCustomerDto,
    description: 'Thông tin đăng nhập',
    examples: {
      login: {
        summary: 'Đăng nhập với email và password',
        value: {
          email: 'nguyenvana@email.com',
          password: 'password123',
        },
      },
    },
  })
  async login(@Body() loginCustomerDto: LoginCustomerDto) {
    const result = await this.customersService.login(loginCustomerDto);
    return {
      success: true,
      message: 'Đăng nhập thành công',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách khách hàng (Admin)',
    description: 'Lấy danh sách tất cả khách hàng với phân trang',
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
  @ApiOkResponse({
    description: 'Lấy danh sách thành công',
    example: {
      success: true,
      message: 'Lấy danh sách khách hàng thành công',
      data: {
        items: [
          {
            _id: '60d5f484e1a2f5001f647abc',
            fullName: 'Nguyễn Văn An',
            phone: '0987654321',
            email: 'nguyenvana@email.com',
            address: '123 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        total: 100,
        page: 1,
        limit: 10,
        totalPages: 10,
        hasNextPage: true,
        hasPrevPage: false,
      },
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const customers = await this.customersService.findAll(
      parseInt(page),
      parseInt(limit),
    );
    return {
      success: true,
      message: 'Lấy danh sách khách hàng thành công',
      data: customers,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin khách hàng theo ID',
    description: 'Lấy thông tin chi tiết của một khách hàng cụ thể',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID của khách hàng (MongoDB ObjectId)',
    example: '60d5f484e1a2f5001f647abc',
  })
  @ApiOkResponse({
    description: 'Lấy thông tin thành công',
    type: CustomerResponseDto,
    example: {
      success: true,
      message: 'Lấy thông tin khách hàng thành công',
      data: {
        _id: '60d5f484e1a2f5001f647abc',
        fullName: 'Nguyễn Văn An',
        phone: '0987654321',
        email: 'nguyenvana@email.com',
        address: '123 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy khách hàng',
    example: {
      success: false,
      message: 'Không tìm thấy khách hàng',
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  async findOne(@Param('id') id: string) {
    const customer = await this.customersService.findOne(id);
    return {
      success: true,
      message: 'Lấy thông tin khách hàng thành công',
      data: customer,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật thông tin khách hàng',
    description:
      'Cập nhật thông tin cá nhân của khách hàng (không bao gồm email và password)',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID của khách hàng',
    example: '60d5f484e1a2f5001f647abc',
  })
  @ApiBody({
    type: UpdateCustomerDto,
    description: 'Thông tin cần cập nhật',
    examples: {
      updateProfile: {
        summary: 'Cập nhật thông tin cơ bản',
        value: {
          fullName: 'Nguyễn Văn An (Đã cập nhật)',
          phone: '0987654322',
          address: '456 Lê Văn Sỹ, Phường 12, Quận 3, TP.HCM',
        },
      },
      updatePhone: {
        summary: 'Chỉ cập nhật số điện thoại',
        value: {
          phone: '0987654323',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Cập nhật thành công',
    type: CustomerResponseDto,
    example: {
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: {
        _id: '60d5f484e1a2f5001f647abc',
        fullName: 'Nguyễn Văn An (Đã cập nhật)',
        phone: '0987654322',
        email: 'nguyenvana@email.com',
        address: '456 Lê Văn Sỹ, Phường 12, Quận 3, TP.HCM',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T01:00:00.000Z',
      },
      timestamp: '2024-01-01T01:00:00.000Z',
    },
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy khách hàng',
  })
  @ApiConflictResponse({
    description: 'Số điện thoại đã được sử dụng',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    const customer = await this.customersService.update(id, updateCustomerDto);
    return {
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: customer,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id/change-password')
  @ApiOperation({
    summary: 'Đổi mật khẩu khách hàng',
    description:
      'Thay đổi mật khẩu cho khách hàng với xác thực mật khẩu hiện tại',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID của khách hàng',
    example: '60d5f484e1a2f5001f647abc',
  })
  @ApiBody({
    type: ChangePasswordDto,
    description: 'Thông tin đổi mật khẩu',
    examples: {
      changePassword: {
        summary: 'Đổi mật khẩu',
        value: {
          currentPassword: 'oldpassword123',
          newPassword: 'newpassword456',
          confirmPassword: 'newpassword456',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Đổi mật khẩu thành công',
    example: {
      success: true,
      message: 'Đổi mật khẩu thành công',
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiBadRequestResponse({
    description: 'Mật khẩu hiện tại không đúng hoặc mật khẩu mới không khớp',
    example: {
      success: false,
      message: 'Mật khẩu hiện tại không đúng',
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy khách hàng',
  })
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const result = await this.customersService.changePassword(
      id,
      changePasswordDto,
    );
    return {
      success: true,
      message: result.message,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa khách hàng (Admin)',
    description: 'Xóa khách hàng khỏi hệ thống (chỉ dành cho Admin)',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID của khách hàng cần xóa',
    example: '60d5f484e1a2f5001f647abc',
  })
  @ApiOkResponse({
    description: 'Xóa khách hàng thành công',
    example: {
      success: true,
      message: 'Xóa khách hàng thành công',
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy khách hàng',
    example: {
      success: false,
      message: 'Không tìm thấy khách hàng',
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  async remove(@Param('id') id: string) {
    const result = await this.customersService.remove(id);
    return {
      success: true,
      message: result.message,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Làm mới access token',
    description: 'Sử dụng refresh token để tạo access token mới',
  })
  @ApiBody({
    description: 'Refresh token',
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          description: 'JWT Refresh Token',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      required: ['refreshToken'],
    },
  })
  @ApiOkResponse({
    description: 'Làm mới token thành công',
    example: {
      success: true,
      message: 'Làm mới token thành công',
      data: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: 86400,
      },
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token không hợp lệ',
    example: {
      success: false,
      message: 'Token không hợp lệ',
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    const result = await this.customersService.refreshToken(refreshToken);
    return {
      success: true,
      message: 'Làm mới token thành công',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Quên mật khẩu - Gửi email đặt lại',
    description: 'Gửi email chứa link đặt lại mật khẩu đến email khách hàng',
  })
  @ApiBody({
    type: ForgotPasswordDto,
    description: 'Email để gửi link đặt lại mật khẩu',
    examples: {
      forgotPassword: {
        summary: 'Yêu cầu đặt lại mật khẩu',
        value: {
          email: 'customer@example.com',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Email đã được gửi thành công',
    example: {
      success: true,
      message: 'Link đặt lại mật khẩu đã được gửi tới email của bạn',
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiBadRequestResponse({
    description: 'Email không hợp lệ hoặc lỗi gửi email',
    example: {
      success: false,
      message: 'Không thể gửi email. Vui lòng thử lại sau',
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const result =
      await this.customersService.forgotPassword(forgotPasswordDto);
    return {
      success: true,
      message: result.message,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đặt lại mật khẩu',
    description: 'Đặt lại mật khẩu mới bằng token từ email',
  })
  @ApiBody({
    type: ResetPasswordDto,
    description: 'Thông tin đặt lại mật khẩu',
    examples: {
      resetPassword: {
        summary: 'Đặt lại mật khẩu',
        value: {
          token: 'abc123def456ghi789...',
          newPassword: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Đặt lại mật khẩu thành công',
    example: {
      success: true,
      message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay bây giờ',
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiBadRequestResponse({
    description: 'Token không hợp lệ hoặc mật khẩu không khớp',
    example: {
      success: false,
      message:
        'Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới',
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const result = await this.customersService.resetPassword(resetPasswordDto);
    return {
      success: true,
      message: result.message,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('validate-reset-token/:token')
  @ApiOperation({
    summary: 'Kiểm tra token reset password',
    description:
      'Kiểm tra xem token reset password có hợp lệ và chưa hết hạn không',
  })
  @ApiParam({
    name: 'token',
    type: String,
    description: 'Token reset password cần kiểm tra',
    example: 'abc123def456ghi789...',
  })
  @ApiOkResponse({
    description: 'Thông tin trạng thái token',
    example: {
      success: true,
      data: {
        valid: true,
        message: 'Token hợp lệ',
      },
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  async validateResetToken(@Param('token') token: string) {
    const result = await this.customersService.validateResetToken(token);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }
}
