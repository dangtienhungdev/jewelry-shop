# 📋 Order API Examples - Jewelry Shop

## 🚀 POST `/api/orders` - Tạo đơn hàng

### 🔸 1. Thanh toán tiền mặt (COD) - Không có voucher

```json
{
  "customerId": "64f7b1234567890abcdef012",
  "shippingAddress": "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
  "recipientName": "Nguyễn Thị Hương",
  "recipientPhone": "0987654321",
  "orderDetails": [
    {
      "productId": "64f7b1234567890abcdef123",
      "quantity": 1,
      "priceAtPurchase": 45000000,
      "discountApplied": 0
    }
  ],
  "shippingFee": 30000,
  "paymentMethod": "cash",
  "notes": "Giao hàng buổi chiều sau 2h, gọi trước khi đến"
}
```

**Response mong đợi:**
```json
{
  "order": {
    "_id": "64f7b1234567890abcdef789",
    "orderCode": "ORD20240628001",
    "customerId": "64f7b1234567890abcdef012",
    "totalAmount": 45000000,
    "discountAmount": 0,
    "finalAmount": 45030000,
    "shippingFee": 30000,
    "status": "pending"
  },
  "paymentUrl": null,
  "message": "Đơn hàng đã được tạo thành công. Thanh toán khi nhận hàng."
}
```

### 🔸 2. Thanh toán PayOS - Có voucher giảm 10%

```json
{
  "customerId": "64f7b1234567890abcdef012",
  "shippingAddress": "456 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
  "recipientName": "Trần Văn Nam",
  "recipientPhone": "0123456789",
  "orderDetails": [
    {
      "productId": "64f7b1234567890abcdef123",
      "quantity": 1,
      "priceAtPurchase": 45000000,
      "discountApplied": 0
    },
    {
      "productId": "64f7b1234567890abcdef456",
      "quantity": 2,
      "priceAtPurchase": 2500000,
      "discountApplied": 0
    }
  ],
  "shippingFee": 50000,
  "paymentMethod": "payos",
  "voucherCode": "SALE10",
  "notes": "Gói quà tặng với hộp sang trọng"
}
```

**Response mong đợi:**
```json
{
  "order": {
    "_id": "64f7b1234567890abcdef789",
    "orderCode": "ORD20240628002",
    "customerId": "64f7b1234567890abcdef012",
    "totalAmount": 50000000,
    "discountAmount": 5000000,
    "finalAmount": 45050000,
    "shippingFee": 50000,
    "status": "pending"
  },
  "paymentUrl": "https://pay.payos.vn/web/4b5f6b7c8d9e0f1a2b3c4d5e6f7a8b9c",
  "message": "Đơn hàng đã được tạo. Vui lòng thanh toán qua link PayOS."
}
```

### 🔸 3. Đơn hàng nhiều sản phẩm - Voucher giảm cố định

```json
{
  "customerId": "64f7b1234567890abcdef034",
  "shippingAddress": "789 Pasteur, Phường 6, Quận 3, TP. Hồ Chí Minh",
  "recipientName": "Lê Thị Mai",
  "recipientPhone": "0909123456",
  "orderDetails": [
    {
      "productId": "64f7b1234567890abcdef123",
      "quantity": 1,
      "priceAtPurchase": 45000000,
      "discountApplied": 0
    },
    {
      "productId": "64f7b1234567890abcdef456",
      "quantity": 1,
      "priceAtPurchase": 8500000,
      "discountApplied": 0
    },
    {
      "productId": "64f7b1234567890abcdef789",
      "quantity": 2,
      "priceAtPurchase": 2500000,
      "discountApplied": 0
    }
  ],
  "shippingFee": 0,
  "paymentMethod": "cash",
  "voucherCode": "WELCOME500K",
  "notes": "Freeship cho đơn hàng trên 50 triệu"
}
```

**Response mong đợi:**
```json
{
  "order": {
    "_id": "64f7b1234567890abcdef790",
    "orderCode": "ORD20240628003",
    "customerId": "64f7b1234567890abcdef034",
    "totalAmount": 58500000,
    "discountAmount": 500000,
    "finalAmount": 58000000,
    "shippingFee": 0,
    "status": "pending"
  },
  "paymentUrl": null,
  "message": "Đơn hàng đã được tạo thành công. Thanh toán khi nhận hàng."
}
```

### 🔸 4. Đơn hàng khách hàng VIP - PayOS

```json
{
  "customerId": "64f7b1234567890abcdef055",
  "shippingAddress": "101 Võ Văn Tần, Phường 6, Quận 3, TP. Hồ Chí Minh",
  "recipientName": "Phạm Minh Tuấn",
  "recipientPhone": "0888777666",
  "orderDetails": [
    {
      "productId": "64f7b1234567890abcdef100",
      "quantity": 1,
      "priceAtPurchase": 85000000,
      "discountApplied": 5000000
    },
    {
      "productId": "64f7b1234567890abcdef200",
      "quantity": 1,
      "priceAtPurchase": 65000000,
      "discountApplied": 3000000
    }
  ],
  "shippingFee": 0,
  "paymentMethod": "payos",
  "voucherCode": "VIP15",
  "notes": "Khách hàng VIP - Ưu tiên giao hàng"
}
```

## 🛡️ Validation Rules

### ✅ Required Fields:
- `customerId`: ObjectId hợp lệ
- `shippingAddress`: Tối thiểu 10 ký tự
- `recipientName`: Tối thiểu 2 ký tự
- `recipientPhone`: Số điện thoại hợp lệ
- `orderDetails`: Mảng chứa ít nhất 1 sản phẩm
- `paymentMethod`: "cash" hoặc "payos"

### ⚙️ Optional Fields:
- `shippingFee`: Mặc định 30,000 VND
- `voucherCode`: Mã voucher (nếu có)
- `notes`: Ghi chú đặc biệt

### 📊 OrderDetails Rules:
- `productId`: ObjectId của sản phẩm trong database
- `quantity`: Số nguyên >= 1
- `priceAtPurchase`: Số thực >= 0 (giá tại thời điểm đặt)
- `discountApplied`: Số thực >= 0 (giảm giá riêng cho sản phẩm)

## 🔄 Tính toán tự động:

1. **totalAmount** = Σ(quantity × priceAtPurchase) cho tất cả orderDetails
2. **discountAmount** = Voucher discount (nếu có)
3. **finalAmount** = totalAmount - discountAmount + shippingFee

## 📝 Payment Methods:

### 💵 Cash (COD):
- Thanh toán khi nhận hàng
- Không có paymentUrl
- Status ban đầu: "pending"

### 💳 PayOS:
- Thanh toán trực tuyến
- Trả về paymentUrl để chuyển hướng
- Webhook tự động cập nhật status khi thanh toán

## 🎫 Voucher Examples:

| Mã Voucher | Loại | Giá trị | Điều kiện |
|------------|------|---------|-----------|
| WELCOME10 | Percentage | 10% | Đơn hàng từ 1 triệu |
| SALE500K | Fixed | 500,000 VND | Đơn hàng từ 5 triệu |
| VIP15 | Percentage | 15% | Khách VIP, tối đa 10 triệu |
| NEWCUSTOMER | Fixed | 1,000,000 VND | Khách hàng mới |

## ❌ Common Errors:

```json
// 400 - Voucher hết hạn
{
  "statusCode": 400,
  "message": "Voucher đã hết hạn",
  "error": "Bad Request"
}

// 400 - Đơn hàng không đủ điều kiện voucher
{
  "statusCode": 400,
  "message": "Đơn hàng phải có giá trị tối thiểu 1,000,000 VND",
  "error": "Bad Request"
}

// 404 - Không tìm thấy voucher
{
  "statusCode": 404,
  "message": "Không tìm thấy mã voucher",
  "error": "Not Found"
}

// 400 - Validation error
{
  "statusCode": 400,
  "message": [
    "Số lượng phải lớn hơn 0",
    "Customer ID phải là ObjectId hợp lệ"
  ],
  "error": "Bad Request"
}
```

## 🔧 Testing với Postman/Curl:

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "64f7b1234567890abcdef012",
    "shippingAddress": "123 Nguyễn Huệ, Q1, HCM",
    "recipientName": "Nguyễn Văn A",
    "recipientPhone": "0987654321",
    "orderDetails": [{
      "productId": "64f7b1234567890abcdef123",
      "quantity": 1,
      "priceAtPurchase": 45000000
    }],
    "paymentMethod": "cash"
  }'
```

## 📚 Related APIs:

- `GET /api/orders` - Lấy danh sách đơn hàng
- `GET /api/orders/:id` - Chi tiết đơn hàng
- `PATCH /api/orders/:id` - Cập nhật đơn hàng
- `PATCH /api/orders/:id/cancel` - Hủy đơn hàng
- `GET /api/orders/:id/payments` - Lịch sử thanh toán
- `POST /api/orders/payos/webhook` - PayOS webhook

---

💡 **Tip**: Sử dụng Swagger UI tại `http://localhost:3000/api` để test API trực tiếp với giao diện thân thiện!