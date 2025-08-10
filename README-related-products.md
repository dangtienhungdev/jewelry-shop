# Chức Năng Sản Phẩm Liên Quan

## Tổng quan

Đã bổ sung thành công chức năng lấy sản phẩm liên quan trong cùng một danh mục cho hệ thống jewelry shop.

## Các thay đổi đã thực hiện

### 1. Backend (jewelry-shop)

#### API Endpoint mới
- **URL**: `GET /products/:id/related`
- **Mô tả**: Lấy danh sách sản phẩm liên quan trong cùng danh mục
- **Tham số**:
  - `id` (path): ID sản phẩm
  - `limit` (query): Số lượng sản phẩm tối đa (mặc định: 8)

#### Files đã cập nhật:

**`src/products/products.controller.ts`**
- Thêm endpoint `getRelatedProducts`
- Swagger documentation đầy đủ
- Response format chuẩn

**`src/products/products.service.ts`**
- Thêm method `getRelatedProducts`
- Logic tìm sản phẩm cùng danh mục
- Loại trừ sản phẩm hiện tại
- Sắp xếp theo lượt xem và ngày tạo
- Chỉ lấy sản phẩm còn hàng

**`docs/related-products-api.md`**
- Documentation chi tiết cho API
- Ví dụ sử dụng với cURL, JavaScript, Axios
- Mô tả logic hoạt động

### 2. Frontend (jewelry-customer)

#### API Integration
**`src/apis/products/product.api.ts`**
- Thêm method `getRelatedProducts`
- TypeScript types đầy đủ

**`src/apis/products/useProducts.ts`**
- Thêm hook `useRelatedProducts`
- React Query integration
- Cache management

#### Component Updates
**`src/pages/product-detail/components/RelatedProducts.tsx`**
- Thay thế mock data bằng API thực tế
- Loading states
- Error handling
- Empty states
- Navigation đến trang chi tiết sản phẩm
- Responsive design

## Cách sử dụng

### Backend
```bash
# Lấy 8 sản phẩm liên quan (mặc định)
GET /products/60d5f484e1a2f5001f647abc/related

# Lấy 6 sản phẩm liên quan
GET /products/60d5f484e1a2f5001f647abc/related?limit=6
```

### Frontend
```typescript
// Sử dụng hook
const { data, isLoading, error } = useRelatedProducts(productId, 8);

// Sử dụng API trực tiếp
const response = await productApi.getRelatedProducts(productId, 8);
```

## Logic hoạt động

1. **Validate ID sản phẩm**: Kiểm tra tính hợp lệ của ObjectId
2. **Lấy thông tin sản phẩm**: Tìm sản phẩm theo ID để lấy categoryId
3. **Tìm sản phẩm liên quan**:
   - Cùng danh mục với sản phẩm hiện tại
   - Loại trừ sản phẩm hiện tại (`$ne`)
   - Chỉ lấy sản phẩm còn hàng (`stockQuantity > 0`)
4. **Sắp xếp kết quả**:
   - Ưu tiên theo lượt xem giảm dần (`views: -1`)
   - Sau đó theo ngày tạo giảm dần (`createdAt: -1`)
5. **Giới hạn số lượng**: Theo tham số limit

## Response Format

```json
{
  "success": true,
  "message": "Lấy sản phẩm liên quan thành công",
  "data": {
    "items": [
      {
        "id": "60d5f484e1a2f5001f647abc",
        "productName": "Nhẫn Kim cương Solitaire 1 carat",
        "price": 45000000,
        "discountedPrice": 42000000,
        "effectivePrice": 42000000,
        "discountPercentage": 7,
        "category": {
          "id": "60d5f484e1a2f5001f647def",
          "categoryName": "Nhẫn",
          "description": "Các loại nhẫn trang sức"
        },
        "images": ["https://example.com/image1.jpg"],
        "stockQuantity": 5,
        "views": 1250
      }
    ],
    "total": 1,
    "limit": 8
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Handling

- **400 Bad Request**: ID sản phẩm không hợp lệ
- **404 Not Found**: Không tìm thấy sản phẩm
- **Frontend**: Loading states, error states, empty states

## Performance Considerations

- **Database Indexes**: Sử dụng indexes có sẵn cho `categoryId`, `views`, `createdAt`
- **Caching**: React Query cache với stale time 5 phút
- **Pagination**: Giới hạn số lượng kết quả trả về
- **Population**: Chỉ populate các fields cần thiết

## Testing

### Backend Testing
```bash
# Test API endpoint
curl -X GET "http://localhost:3000/products/60d5f484e1a2f5001f647abc/related?limit=4" \
  -H "Content-Type: application/json"
```

### Frontend Testing
- Component renders correctly với loading state
- API calls work properly
- Navigation functions correctly
- Error handling displays appropriate messages

## Future Enhancements

1. **Advanced Filtering**: Thêm filter theo giá, chất liệu
2. **Personalization**: Dựa trên lịch sử xem sản phẩm
3. **Machine Learning**: Recommendation algorithms
4. **Caching**: Redis cache cho kết quả phổ biến
5. **Analytics**: Track click-through rates

## Dependencies

### Backend
- NestJS
- MongoDB/Mongoose
- Swagger/OpenAPI

### Frontend
- React
- React Query
- React Router
- TypeScript

## Notes

- API chỉ trả về sản phẩm còn hàng để đảm bảo UX tốt
- Sản phẩm hiện tại được loại trừ khỏi danh sách liên quan
- Component có thể được sử dụng ở nhiều nơi khác nhau với props tùy chỉnh
- Documentation đầy đủ cho việc maintain và extend