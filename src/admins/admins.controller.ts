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

import { AdminsService } from './admins.service';
import { AdminResponseDto, LoginResponseDto } from './dto/admin-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@ApiTags('🔐 Admins - Quản lý quản trị viên')
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Tạo tài khoản quản trị viên mới',
    description:
      'Tạo tài khoản quản trị viên mới với username và email duy nhất',
  })
  @ApiCreatedResponse({
    description: 'Tạo tài khoản thành công',
    type: AdminResponseDto,
    example: {
      success: true,
      message: 'Tạo tài khoản quản trị viên thành công',
      data: {
        _id: '60d5f484e1a2f5001f647abc',
        username: 'admin01',
        email: 'admin@jewelry-shop.com',
        role: 'Staff',
        lastLogin: null,
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
        'Tên đăng nhập phải từ 3-50 ký tự',
      ],
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiConflictResponse({
    description: 'Username hoặc email đã tồn tại',
    example: {
      success: false,
      message: 'Tên đăng nhập đã được sử dụng',
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiBody({
    type: CreateAdminDto,
    description: 'Thông tin tạo tài khoản quản trị viên',
    examples: {
      staff: {
        summary: 'Tạo tài khoản Staff',
        value: {
          username: 'staff01',
          email: 'staff@jewelry-shop.com',
          password: 'staffpassword123',
          role: 'Staff',
        },
      },
      superAdmin: {
        summary: 'Tạo tài khoản SuperAdmin',
        value: {
          username: 'superadmin',
          email: 'superadmin@jewelry-shop.com',
          password: 'superadminpassword123',
          role: 'SuperAdmin',
        },
      },
    },
  })
  async create(@Body() createAdminDto: CreateAdminDto) {
    const admin = await this.adminsService.create(createAdminDto);
    return {
      success: true,
      message: 'Tạo tài khoản quản trị viên thành công',
      data: admin,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng nhập quản trị viên',
    description: 'Xác thực thông tin đăng nhập và trả về JWT tokens',
  })
  @ApiOkResponse({
    description: 'Đăng nhập thành công',
    type: LoginResponseDto,
    example: {
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        admin: {
          _id: '60d5f484e1a2f5001f647abc',
          username: 'admin01',
          email: 'admin@jewelry-shop.com',
          role: 'Staff',
          lastLogin: '2024-01-01T00:00:00.000Z',
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
      message: 'Thông tin đăng nhập không đúng',
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiBody({
    type: LoginAdminDto,
    description: 'Thông tin đăng nhập',
    examples: {
      withUsername: {
        summary: 'Đăng nhập với username',
        value: {
          usernameOrEmail: 'admin01',
          password: 'adminpassword123',
        },
      },
      withEmail: {
        summary: 'Đăng nhập với email',
        value: {
          usernameOrEmail: 'admin@jewelry-shop.com',
          password: 'adminpassword123',
        },
      },
    },
  })
  async login(@Body() loginAdminDto: LoginAdminDto) {
    const result = await this.adminsService.login(loginAdminDto);
    return {
      success: true,
      message: 'Đăng nhập thành công',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách quản trị viên',
    description: 'Lấy danh sách tất cả quản trị viên với phân trang',
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
      message: 'Lấy danh sách quản trị viên thành công',
      data: {
        items: [
          {
            _id: '60d5f484e1a2f5001f647abc',
            username: 'admin01',
            email: 'admin@jewelry-shop.com',
            role: 'Staff',
            lastLogin: '2024-01-01T00:00:00.000Z',
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
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const admins = await this.adminsService.findAll(
      parseInt(page),
      parseInt(limit),
    );
    return {
      success: true,
      message: 'Lấy danh sách quản trị viên thành công',
      data: admins,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin quản trị viên theo ID',
    description: 'Lấy thông tin chi tiết của một quản trị viên cụ thể',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID của quản trị viên (MongoDB ObjectId)',
    example: '60d5f484e1a2f5001f647abc',
  })
  @ApiOkResponse({
    description: 'Lấy thông tin thành công',
    type: AdminResponseDto,
    example: {
      success: true,
      message: 'Lấy thông tin quản trị viên thành công',
      data: {
        _id: '60d5f484e1a2f5001f647abc',
        username: 'admin01',
        email: 'admin@jewelry-shop.com',
        role: 'Staff',
        lastLogin: '2024-01-01T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy quản trị viên',
    example: {
      success: false,
      message: 'Không tìm thấy quản trị viên',
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  async findOne(@Param('id') id: string) {
    const admin = await this.adminsService.findOne(id);
    return {
      success: true,
      message: 'Lấy thông tin quản trị viên thành công',
      data: admin,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật thông tin quản trị viên',
    description:
      'Cập nhật thông tin quản trị viên (không bao gồm email và password)',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID của quản trị viên',
    example: '60d5f484e1a2f5001f647abc',
  })
  @ApiBody({
    type: UpdateAdminDto,
    description: 'Thông tin cần cập nhật',
    examples: {
      updateUsername: {
        summary: 'Cập nhật username',
        value: {
          username: 'admin01_updated',
        },
      },
      updateRole: {
        summary: 'Cập nhật vai trò',
        value: {
          role: 'SuperAdmin',
        },
      },
      updateAll: {
        summary: 'Cập nhật cả username và role',
        value: {
          username: 'superadmin01',
          role: 'SuperAdmin',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Cập nhật thành công',
    type: AdminResponseDto,
    example: {
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: {
        _id: '60d5f484e1a2f5001f647abc',
        username: 'admin01_updated',
        email: 'admin@jewelry-shop.com',
        role: 'SuperAdmin',
        lastLogin: '2024-01-01T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T01:00:00.000Z',
      },
      timestamp: '2024-01-01T01:00:00.000Z',
    },
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy quản trị viên',
  })
  @ApiConflictResponse({
    description: 'Tên đăng nhập đã được sử dụng',
  })
  async update(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    const admin = await this.adminsService.update(id, updateAdminDto);
    return {
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: admin,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id/change-password')
  @ApiOperation({
    summary: 'Đổi mật khẩu quản trị viên',
    description:
      'Thay đổi mật khẩu cho quản trị viên với xác thực mật khẩu hiện tại',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID của quản trị viên',
    example: '60d5f484e1a2f5001f647abc',
  })
  @ApiBody({
    type: ChangePasswordDto,
    description: 'Thông tin đổi mật khẩu',
    examples: {
      changePassword: {
        summary: 'Đổi mật khẩu',
        value: {
          currentPassword: 'oldadminpassword123',
          newPassword: 'newadminpassword456',
          confirmPassword: 'newadminpassword456',
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
    description: 'Không tìm thấy quản trị viên',
  })
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const result = await this.adminsService.changePassword(
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
    summary: 'Xóa quản trị viên',
    description:
      'Xóa quản trị viên khỏi hệ thống (không thể xóa SuperAdmin cuối cùng)',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID của quản trị viên cần xóa',
    example: '60d5f484e1a2f5001f647abc',
  })
  @ApiOkResponse({
    description: 'Xóa quản trị viên thành công',
    example: {
      success: true,
      message: 'Xóa quản trị viên thành công',
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy quản trị viên',
    example: {
      success: false,
      message: 'Không tìm thấy quản trị viên',
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  @ApiBadRequestResponse({
    description: 'Không thể xóa SuperAdmin cuối cùng',
    example: {
      success: false,
      message: 'Không thể xóa quản trị viên cấp cao cuối cùng',
      timestamp: '2024-01-01T00:00:00.000Z',
    },
  })
  async remove(@Param('id') id: string) {
    const result = await this.adminsService.remove(id);
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
    const result = await this.adminsService.refreshToken(refreshToken);
    return {
      success: true,
      message: 'Làm mới token thành công',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }
}
