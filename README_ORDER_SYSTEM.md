# Order System API Documentation

## Tổng Quan

Hệ thống đặt hàng jewelry-shop với tích hợp PayOS cho thanh toán online và hỗ trợ thanh toán tiền mặt.

## Tính Năng

### 🛒 Order Management
- Tạo đơn hàng với nhiều sản phẩm
- 5 trạng thái đơn hàng: `pending`, `confirmed`, `shipping`, `success`, `failed`
- Tính toán tự động: tổng tiền, giảm giá, phí vận chuyển
- Hỗ trợ ghi chú đơn hàng

### 💰 Payment Integration
- **Thanh toán tiền mặt**: Thanh toán khi nhận hàng (COD)
- **Thanh toán PayOS**: Chuyển khoản ngân hàng qua QR code
- Webhook PayOS để cập nhật trạng thái thanh toán real-time

### 🎫 Voucher System
- Voucher giảm giá theo phần trăm hoặc số tiền cố định
- Điều kiện áp dụng: giá trị đơn hàng tối thiểu, giới hạn số lần sử dụng
- Validation voucher trước khi áp dụng

### 📊 Order Statistics
- Thống kê đơn hàng theo thời gian
- Báo cáo doanh thu
- Phân tích trạng thái đơn hàng

## API Endpoints

### Orders API

#### Tạo đơn hàng mới
```http
POST /api/orders
Content-Type: application/json

{
  "customerId": "64f7b1234567890abcdef012",
  "shippingAddress": "123 Nguyễn Huệ, Q1, HCM",
  "recipientName": "Nguyễn Văn A",
  "recipientPhone": "0987654321",
  "orderDetails": [
    {
      "productId": "64f7b1234567890abcdef123",
      "quantity": 2,
      "priceAtPurchase": 50000000
    }
  ],
  "paymentMethod": "payos", // hoặc "cash"
  "voucherCode": "WELCOME10", // optional
  "shippingFee": 30000,
  "notes": "Giao hàng buổi sáng"
}
```

**Response Success:**
```json
{
  "order": {
    "_id": "64f7b1234567890abcdef789",
    "orderCode": "ORD-20240115-001",
    "customerId": "64f7b1234567890abcdef012",
    "totalAmount": 100000000,
    "discountAmount": 10000000,
    "finalAmount": 90030000,
    "status": "pending",
    "orderDetails": [...],
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "paymentUrl": "https://pay.payos.vn/web/64f7...", // Nếu PayOS
  "message": "Đơn hàng đã được tạo. Vui lòng thanh toán qua link PayOS."
}
```

#### Lấy danh sách đơn hàng
```http
GET /api/orders?page=1&limit=10&status=pending&customerId=64f7...
```

#### Chi tiết đơn hàng
```http
GET /api/orders/{orderId}
```

#### Cập nhật trạng thái đơn hàng
```http
PATCH /api/orders/{orderId}
Content-Type: application/json

{
  "status": "confirmed",
  "processedBy": "64f7b1234567890abcdef345",
  "notes": "Đã xác nhận đơn hàng"
}
```

#### Hủy đơn hàng
```http
PATCH /api/orders/{orderId}/cancel
Content-Type: application/json

{
  "reason": "Khách hàng hủy"
}
```

#### Lịch sử thanh toán
```http
GET /api/orders/{orderId}/payments
```

#### Thống kê đơn hàng
```http
GET /api/orders/stats?startDate=2024-01-01&endDate=2024-01-31
```

### Vouchers API

#### Tạo voucher
```http
POST /api/vouchers
Content-Type: application/json

{
  "discountCode": "WELCOME10",
  "discountName": "Giảm giá chào mừng",
  "discountType": "Percentage",
  "discountValue": 10,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.000Z",
  "minOrderValue": 500000,
  "maxDiscountAmount": 100000,
  "usageLimit": 100,
  "createdBy": "64f7b1234567890abcdef012"
}
```

#### Kiểm tra voucher
```http
POST /api/vouchers/validate
Content-Type: application/json

{
  "voucherCode": "WELCOME10",
  "orderValue": 1000000
}
```

**Response:**
```json
{
  "isValid": true,
  "message": "Voucher hợp lệ",
  "discountAmount": 100000,
  "voucher": { ... }
}
```

#### Lấy voucher đang hoạt động
```http
GET /api/vouchers/active
```

### PayOS Webhook
```http
POST /api/orders/payos/webhook
Content-Type: application/json

{
  "code": "00",
  "desc": "success",
  "data": {
    "orderCode": 1234567890,
    "amount": 90030000,
    // ... PayOS webhook data
  },
  "signature": "..."
}
```

## Trạng Thái Đơn Hàng

| Trạng thái | Mô tả | Có thể chuyển sang |
|------------|-------|-------------------|
| `pending` | Đang chờ xử lý | `confirmed`, `failed` |
| `confirmed` | Đã xác nhận | `shipping`, `failed` |
| `shipping` | Đang vận chuyển | `success`, `failed` |
| `success` | Hoàn thành | - |
| `failed` | Thất bại/Hủy | - |

## Workflow Thanh Toán

### Thanh Toán PayOS
1. Customer tạo order với `paymentMethod: "payos"`
2. System tạo PayOS payment link
3. Customer thanh toán qua link PayOS
4. PayOS gửi webhook về system
5. System cập nhật trạng thái order và payment

### Thanh Toán Tiền Mặt
1. Customer tạo order với `paymentMethod: "cash"`
2. System tạo payment record với status `pending`
3. Order chờ xác nhận và giao hàng
4. Admin cập nhật payment status khi nhận tiền

## Cấu Hình PayOS

Thêm vào file `.env`:
```env
PAYOS_CLIENT_ID="bd9101ab-46d2-4915-bb71-7ddad941e380"
PAYOS_API_KEY="34f17c94-2429-4d0b-8596-fc0cd7a0dd9d"
PAYOS_CHECKSUM_KEY="d6abbd2d344d2b40356a47b8c825f8d99cb465e7f1ce332b73003d68064bcac6"
FRONTEND_URL="http://localhost:3000"
```

## Error Handling

### Common Error Responses
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}

{
  "statusCode": 404,
  "message": "Không tìm thấy đơn hàng",
  "error": "Not Found"
}
```

### PayOS Errors
- Invalid credentials
- Insufficient balance
- Network timeout
- Invalid webhook signature

## Database Schema

### Orders Collection
```javascript
{
  _id: ObjectId,
  customerId: ObjectId,
  orderCode: String, // Auto-generated
  orderDate: Date,
  totalAmount: Number,
  discountAmount: Number,
  finalAmount: Number,
  status: String, // enum
  shippingAddress: String,
  recipientName: String,
  recipientPhone: String,
  orderDetails: [{
    productId: ObjectId,
    quantity: Number,
    priceAtPurchase: Number,
    discountApplied: Number
  }],
  appliedDiscounts: [{
    discountId: ObjectId,
    discountAmount: Number
  }],
  shippingFee: Number,
  notes: String,
  processedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Payments Collection
```javascript
{
  _id: ObjectId,
  orderId: ObjectId,
  paymentMethod: String, // "cash" | "payos"
  amount: Number,
  status: String, // "pending" | "completed" | "failed" | "cancelled"
  paymentDate: Date,
  transactionCode: String,
  payosOrderId: Number,
  payosPaymentLinkId: String,
  verifiedBy: ObjectId,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Testing

### Test Data Setup
```bash
# Tạo voucher test
curl -X POST http://localhost:3001/api/vouchers \
  -H "Content-Type: application/json" \
  -d '{
    "discountCode": "TEST10",
    "discountName": "Test Voucher",
    "discountType": "Percentage",
    "discountValue": 10,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.000Z",
    "minOrderValue": 100000,
    "createdBy": "admin_id_here"
  }'
```

### Test PayOS Webhook
```bash
curl -X POST http://localhost:3001/api/orders/payos/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "code": "00",
    "desc": "success",
    "data": {
      "orderCode": 1234567890,
      "amount": 1000000
    }
  }'
```

## Swagger Documentation

API documentation available at: `http://localhost:3001/api/docs`

## Support

- **Email**: support@jewelryshop.com
- **PayOS Documentation**: https://payos.vn/docs
- **GitHub Issues**: [Repository Issues]()