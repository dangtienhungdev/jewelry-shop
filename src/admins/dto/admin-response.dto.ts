import { ApiProperty } from '@nestjs/swagger';

export class AdminResponseDto {
  @ApiProperty({
    description: 'ID quản trị viên',
    example: '60d5f484e1a2f5001f647abc',
  })
  _id: string;

  @ApiProperty({
    description: 'Tên đăng nhập',
    example: 'admin01',
  })
  username: string;

  @ApiProperty({
    description: 'Email',
    example: 'admin@jewelry-shop.com',
  })
  email: string;

  @ApiProperty({
    description: 'Vai trò',
    example: 'Staff',
    enum: ['SuperAdmin', 'Staff'],
  })
  role: string;

  @ApiProperty({
    description: 'Thời gian đăng nhập cuối',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  lastLogin?: Date;

  @ApiProperty({
    description: 'Thời gian tạo tài khoản',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật cuối',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Thông tin quản trị viên',
    type: AdminResponseDto,
  })
  admin: AdminResponseDto;

  @ApiProperty({
    description: 'JWT Access Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT Refresh Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Thời gian hết hạn token (giây)',
    example: 86400,
  })
  expiresIn: number;
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
