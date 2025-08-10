# API Lấy Sản Phẩm Liên Quan

## Endpoint

```
GET /products/:id/related
```

## Mô tả

API này trả về danh sách các sản phẩm liên quan trong cùng một danh mục với sản phẩm được chỉ định.

## Tham số

### Path Parameters

| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| id | string | Có | ID của sản phẩm |

### Query Parameters

| Tên | Kiểu | Bắt buộc | Mặc định | Mô tả |
|-----|------|----------|----------|-------|
| limit | number | Không | 8 | Số lượng sản phẩm liên quan tối đa |

## Response

### Success Response (200)

```json
{
  "success": true,
  "message": "Lấy sản phẩm liên quan thành công",
  "data": {
    "items": [
      {
        "id": "60d5f484e1a2f5001f647abc",
        "productName": "Nhẫn Kim cương Solitaire 1 carat",
        "description": "Nhẫn kim cương solitaire với viên kim cương 1 carat",
        "price": 45000000,
        "discountedPrice": 42000000,
        "effectivePrice": 42000000,
        "discountPercentage": 7,
        "weight": 3.5,
        "material": "Vàng 18k",
        "stockQuantity": 5,
        "categoryId": "60d5f484e1a2f5001f647def",
        "category": {
          "id": "60d5f484e1a2f5001f647def",
          "categoryName": "Nhẫn",
          "description": "Các loại nhẫn trang sức"
        },
        "isFeatured": true,
        "views": 1250,
        "images": [
          "https://example.com/image1.jpg",
          "https://example.com/image2.jpg"
        ],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 1,
    "limit": 8
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "ID sản phẩm không hợp lệ",
  "error": "Bad Request"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy sản phẩm",
  "error": "Not Found"
}
```

## Logic hoạt động

1. **Kiểm tra ID sản phẩm**: Validate xem ID có hợp lệ không
2. **Lấy thông tin sản phẩm**: Tìm sản phẩm theo ID để lấy categoryId
3. **Tìm sản phẩm liên quan**:
   - Cùng danh mục với sản phẩm hiện tại
   - Loại trừ sản phẩm hiện tại
   - Chỉ lấy sản phẩm còn hàng (stockQuantity > 0)
4. **Sắp xếp kết quả**: Theo lượt xem giảm dần, sau đó theo ngày tạo giảm dần
5. **Giới hạn số lượng**: Theo tham số limit (mặc định 8)

## Ví dụ sử dụng

### cURL
```bash
curl -X GET "http://localhost:3000/products/60d5f484e1a2f5001f647abc/related?limit=6" \
  -H "Content-Type: application/json"
```

### JavaScript (Fetch)
```javascript
const response = await fetch('/products/60d5f484e1a2f5001f647abc/related?limit=6');
const data = await response.json();
console.log(data);
```

### Axios
```javascript
const response = await axios.get('/products/60d5f484e1a2f5001f647abc/related', {
  params: { limit: 6 }
});
console.log(response.data);
```

## Lưu ý

- API chỉ trả về sản phẩm còn hàng (stockQuantity > 0)
- Sản phẩm hiện tại sẽ không xuất hiện trong danh sách liên quan
- Kết quả được sắp xếp ưu tiên theo lượt xem cao nhất
- Nếu không có sản phẩm liên quan, mảng items sẽ rỗng