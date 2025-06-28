export enum OrderStatus {
  PENDING = 'pending', // Đang chờ
  CONFIRMED = 'confirmed', // Xác nhận
  SHIPPING = 'shipping', // Vận chuyển
  SUCCESS = 'success', // Thành công
  FAILED = 'failed', // Thất bại
}

export enum PaymentMethod {
  CASH = 'cash', // Tiền mặt
  PAYOS = 'payos', // Chuyển khoản PayOS
}

export enum PaymentStatus {
  PENDING = 'pending', // Đang chờ
  COMPLETED = 'completed', // Hoàn thành
  FAILED = 'failed', // Thất bại
  CANCELLED = 'cancelled', // Hủy
}
