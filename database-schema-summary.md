# Jewelry Shop Database Schema Summary

## Database: MongoDB (NoSQL)

### 1. COLLECTION: admins
**Description:** Quản lý tài khoản quản trị viên

**Fields:**
- `_id`: ObjectId (Primary Key)
- `username`: String (unique, required, 3-50 chars)
- `email`: String (unique, required, email format)
- `password`: String (required, min 6 chars, hashed)
- `role`: String (enum: 'SuperAdmin', 'Staff', default: 'Staff')
- `lastLogin`: Date (optional)
- `createdAt`: Date (auto)
- `updatedAt`: Date (auto)

**Indexes:**
- username (unique)
- email (unique)
- role
- createdAt
- lastLogin

---

### 2. COLLECTION: customers
**Description:** Quản lý thông tin khách hàng

**Fields:**
- `_id`: ObjectId (Primary Key)
- `fullName`: String (required, 2-100 chars)
- `phone`: String (unique, required, 10-11 digits)
- `email`: String (unique, required, email format)
- `password`: String (required, min 6 chars, hashed)
- `address`: String (optional, max 500 chars)
- `resetPasswordToken`: String (optional)
- `resetPasswordExpires`: Date (optional)
- `createdAt`: Date (auto)
- `updatedAt`: Date (auto)

**Indexes:**
- email (unique)
- phone (unique)
- createdAt

---

### 3. COLLECTION: categories
**Description:** Quản lý danh mục sản phẩm (hierarchical)

**Fields:**
- `_id`: ObjectId (Primary Key)
- `categoryName`: String (required, 2-100 chars)
- `description`: String (optional, max 500 chars)
- `parentId`: ObjectId (optional, ref: Category - for subcategories)
- `isActive`: Boolean (default: true)
- `createdAt`: Date (auto)
- `updatedAt`: Date (auto)

**Indexes:**
- categoryName
- parentId
- isActive
- createdAt

**Relationships:**
- Self-referencing: parentId → _id (same collection)

---

### 4. COLLECTION: products
**Description:** Quản lý thông tin sản phẩm

**Fields:**
- `_id`: ObjectId (Primary Key)
- `productName`: String (required, 3-200 chars)
- `description`: String (optional, max 2000 chars)
- `price`: Number (required, min 0, VNĐ)
- `discountedPrice`: Number (optional, min 0, VNĐ)
- `weight`: Number (required, min 0, grams)
- `material`: String (required, enum: ['Vàng 24k', 'Vàng 18k', 'Vàng 14k', 'Bạc 925', 'Bạc 999', 'Kim cương', 'Ngọc trai', 'Đá quý', 'Khác'])
- `stockQuantity`: Number (required, min 0, default: 0)
- `categoryId`: ObjectId (required, ref: Category)
- `createdBy`: ObjectId (optional, ref: Admin)
- `isFeatured`: Boolean (default: false)
- `views`: Number (default: 0, min 0)
- `discounts`: Array of {discountId: ObjectId, appliedAt: Date} (optional)
- `images`: Array of String (optional, URLs)
- `createdAt`: Date (auto)
- `updatedAt`: Date (auto)

**Indexes:**
- productName + description (text search)
- categoryId
- price
- material
- isFeatured
- stockQuantity
- createdAt
- views
- Compound: (categoryId, isFeatured), (categoryId, price), (material, price)

**Relationships:**
- categoryId → categories._id
- createdBy → admins._id

---

### 5. COLLECTION: carts
**Description:** Quản lý giỏ hàng của khách hàng

**Fields:**
- `_id`: ObjectId (Primary Key)
- `customerId`: String (required, ref: Customer)
- `items`: Array of {
  - `productId`: ObjectId (required, ref: Product)
  - `quantity`: Number (required, min 1)
  - `price`: Number (required, min 0)
  - `discountedPrice`: Number (optional)
  - `addedAt`: Date (default: now)
}
- `totalAmount`: Number (auto-calculated)
- `totalItems`: Number (auto-calculated)
- `createdAt`: Date (auto)
- `updatedAt`: Date (auto)

**Indexes:**
- customerId (unique)
- items.productId
- updatedAt

**Relationships:**
- customerId → customers._id
- items.productId → products._id

---

### 6. COLLECTION: orders
**Description:** Quản lý đơn hàng

**Fields:**
- `_id`: ObjectId (Primary Key)
- `customerId`: ObjectId (required, ref: Customer)
- `orderDate`: Date (default: now)
- `totalAmount`: Number (required, min 0)
- `discountAmount`: Number (default: 0, min 0)
- `finalAmount`: Number (required, min 0)
- `status`: String (enum: 'pending', 'confirmed', 'shipping', 'success', 'failed', default: 'pending')
- `shippingAddress`: String (required)
- `processedBy`: ObjectId (optional, ref: Admin)
- `notes`: String (optional)
- `orderDetails`: Array of {
  - `productId`: ObjectId (required, ref: Product)
  - `quantity`: Number (required, min 1)
  - `priceAtPurchase`: Number (required, min 0)
  - `discountApplied`: Number (default: 0, min 0)
}
- `appliedDiscounts`: Array of {
  - `discountId`: ObjectId (required, ref: Voucher)
  - `discountAmount`: Number (required, min 0)
}
- `orderCode`: String (auto-generated: ORD-YYYYMMDD-XXXX)
- `recipientName`: String (optional)
- `recipientPhone`: String (optional)
- `shippingFee`: Number (default: 0)
- `createdAt`: Date (auto)
- `updatedAt`: Date (auto)

**Indexes:**
- customerId
- status
- orderDate
- orderCode

**Relationships:**
- customerId → customers._id
- processedBy → admins._id
- orderDetails.productId → products._id
- appliedDiscounts.discountId → vouchers._id

---

### 7. COLLECTION: payments
**Description:** Quản lý thông tin thanh toán

**Fields:**
- `_id`: ObjectId (Primary Key)
- `orderId`: ObjectId (required, ref: Order)
- `paymentMethod`: String (enum: 'cash', 'payos', required)
- `paymentDate`: Date (default: now)
- `amount`: Number (required, min 0)
- `transactionCode`: String (optional)
- `status`: String (enum: 'pending', 'completed', 'failed', 'cancelled', default: 'pending')
- `verifiedBy`: ObjectId (optional, ref: Admin)
- `payosOrderId`: Number (optional)
- `payosPaymentLinkId`: String (optional)
- `notes`: String (optional)
- `createdAt`: Date (auto)
- `updatedAt`: Date (auto)

**Indexes:**
- orderId
- paymentMethod
- status
- paymentDate

**Relationships:**
- orderId → orders._id
- verifiedBy → admins._id

---

### 8. COLLECTION: reviews
**Description:** Quản lý đánh giá sản phẩm

**Fields:**
- `_id`: ObjectId (Primary Key)
- `productId`: ObjectId (required, ref: Product)
- `customerId`: ObjectId (required, ref: Customer)
- `orderId`: ObjectId (required, ref: Order)
- `rating`: Number (required, 1-5)
- `title`: String (required, max 200 chars)
- `comment`: String (required, max 1000 chars)
- `reviewDate`: Date (default: now)
- `isApproved`: Boolean (default: false)
- `approvedBy`: ObjectId (optional, ref: Admin)
- `approvedAt`: Date (optional)
- `response`: String (optional, max 500 chars)
- `responseDate`: Date (optional)
- `helpfulCount`: Number (default: 0)
- `isVerifiedPurchase`: Boolean (default: false)
- `images`: Array of String (optional)

**Indexes:**
- (productId, customerId) - unique
- (productId, isApproved)
- customerId
- reviewDate
- rating

**Relationships:**
- productId → products._id
- customerId → customers._id
- orderId → orders._id
- approvedBy → admins._id

---

### 9. COLLECTION: vouchers
**Description:** Quản lý mã giảm giá

**Fields:**
- `_id`: ObjectId (Primary Key)
- `discountCode`: String (required, unique)
- `discountName`: String (required)
- `discountType`: String (enum: 'Percentage', 'FixedAmount', required)
- `discountValue`: Number (required, min 0)
- `startDate`: Date (required)
- `endDate`: Date (required)
- `minOrderValue`: Number (default: 0, min 0)
- `maxDiscountAmount`: Number (optional, min 0)
- `usageLimit`: Number (optional, min 0)
- `usedCount`: Number (default: 0, min 0)
- `isActive`: Boolean (default: true)
- `createdBy`: ObjectId (required, ref: Admin)
- `description`: String (optional)
- `createdAt`: Date (auto)
- `updatedAt`: Date (auto)

**Indexes:**
- discountCode (unique)
- startDate
- endDate
- isActive
- createdBy

**Relationships:**
- createdBy → admins._id

---

## Database Relationships Summary

### One-to-Many Relationships:
1. **Admin → Products**: Một admin có thể tạo nhiều sản phẩm
2. **Admin → Vouchers**: Một admin có thể tạo nhiều voucher
3. **Admin → Orders**: Một admin có thể xử lý nhiều đơn hàng
4. **Admin → Payments**: Một admin có thể xác nhận nhiều thanh toán
5. **Admin → Reviews**: Một admin có thể duyệt nhiều đánh giá
6. **Customer → Orders**: Một khách hàng có thể có nhiều đơn hàng
7. **Customer → Reviews**: Một khách hàng có thể viết nhiều đánh giá
8. **Category → Products**: Một danh mục có thể có nhiều sản phẩm
9. **Product → Reviews**: Một sản phẩm có thể có nhiều đánh giá
10. **Order → Payments**: Một đơn hàng có thể có nhiều thanh toán

### One-to-One Relationships:
1. **Customer ↔ Cart**: Một khách hàng có một giỏ hàng

### Many-to-Many Relationships:
1. **Products ↔ Vouchers**: Thông qua embedded discounts trong Product và appliedDiscounts trong Order
2. **Orders ↔ Vouchers**: Thông qua appliedDiscounts array

### Self-Referencing:
1. **Categories**: parentId → _id (hierarchical structure)

## Notes for Hackolade Studio:
- Use MongoDB as the target database
- All collections have timestamps (createdAt, updatedAt)
- Most fields use ObjectId references for relationships
- Text search indexes are implemented on products
- Compound indexes are used for performance optimization
- Virtual fields exist in Mongoose but won't appear in the actual database
