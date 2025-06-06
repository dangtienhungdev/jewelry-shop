# Database Schema Documentation - Jewelry Shop

## MongoDB Connection

```
mongodb+srv://dangtienhungdev:Htm%4023624@jewelry-shop.v2r4ocu.mongodb.net/?retryWrites=true&w=majority&appName=jewelry-shop
```

## MongoDB Schema Definitions

### 1. Customers Collection

```javascript
// Collection: customers
{
  _id: ObjectId, // Thay thế CustomerID
  fullName: String,
  phone: String,
  email: String,
  password: String, // Nên hash trước khi lưu
  address: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Admins Collection

```javascript
// Collection: admins
{
  _id: ObjectId, // Thay thế AdminID
  username: String,
  email: String,
  password: String, // Nên hash trước khi lưu
  role: String, // 'SuperAdmin', 'Staff'
  createdAt: Date,
  lastLogin: Date
}
```

### 3. Categories Collection

```javascript
// Collection: categories
{
  _id: ObjectId, // Thay thế CategoryID
  categoryName: String,
  description: String,
  parentId: ObjectId, // Reference đến category cha, null nếu là root
  isActive: Boolean, // default: true
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Products Collection

```javascript
// Collection: products
{
  _id: ObjectId, // Thay thế ProductID
  productName: String,
  description: String,
  price: Number,
  discountedPrice: Number, // Giá sau giảm
  weight: Number,
  material: String,
  stockQuantity: Number,
  categoryId: ObjectId, // Reference đến categories
  createdBy: ObjectId, // Reference đến admins
  createdAt: Date,
  updatedAt: Date,
  isFeatured: Boolean, // default: false
  views: Number, // default: 0
  // Embedded discounts cho sản phẩm này
  discounts: [{
    discountId: ObjectId, // Reference đến discounts
    appliedAt: Date
  }]
}
```

### 5. Orders Collection

```javascript
// Collection: orders
{
  _id: ObjectId, // Thay thế OrderID
  customerId: ObjectId, // Reference đến customers
  orderDate: Date,
  totalAmount: Number,
  discountAmount: Number, // default: 0
  finalAmount: Number,
  status: String, // 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'
  shippingAddress: String,
  processedBy: ObjectId, // Reference đến admins, nullable
  notes: String,

  // Embedded order details
  orderDetails: [{
    productId: ObjectId, // Reference đến products
    quantity: Number,
    priceAtPurchase: Number,
    discountApplied: Number // default: 0
  }],

  // Embedded discounts applied
  appliedDiscounts: [{
    discountId: ObjectId, // Reference đến discounts
    discountAmount: Number // Số tiền đã giảm thực tế
  }],

  createdAt: Date,
  updatedAt: Date
}
```

### 6. Payments Collection

```javascript
// Collection: payments
{
  _id: ObjectId, // Thay thế PaymentID
  orderId: ObjectId, // Reference đến orders
  paymentMethod: String, // 'Cash', 'Transfer', 'COD'
  paymentDate: Date,
  amount: Number,
  transactionCode: String, // Mã giao dịch ngân hàng
  status: String, // 'Pending', 'Completed', 'Failed', 'Refunded'
  verifiedBy: ObjectId, // Reference đến admins, nullable
  createdAt: Date
}
```

### 7. Discounts Collection

```javascript
// Collection: discounts
{
  _id: ObjectId, // Thay thế DiscountID
  discountCode: String, // unique
  discountName: String,
  discountType: String, // 'Percentage', 'FixedAmount'
  discountValue: Number,
  startDate: Date,
  endDate: Date,
  minOrderValue: Number, // default: 0
  maxDiscountAmount: Number, // nullable
  usageLimit: Number, // nullable
  usedCount: Number, // default: 0
  isActive: Boolean, // default: true
  createdBy: ObjectId, // Reference đến admins
  createdAt: Date
}
```

### 8. Reviews Collection

```javascript
// Collection: reviews
{
  _id: ObjectId, // Thay thế ReviewID
  productId: ObjectId, // Reference đến products
  customerId: ObjectId, // Reference đến customers
  orderId: ObjectId, // Reference đến orders
  rating: Number, // 1-5 sao
  title: String,
  comment: String,
  reviewDate: Date,
  isApproved: Boolean, // default: false
  approvedBy: ObjectId, // Reference đến admins, nullable
  approvedAt: Date, // nullable
  response: String, // Phản hồi từ cửa hàng
  responseDate: Date // nullable
}
```

### 9. Shippings Collection

```javascript
// Collection: shippings
{
  _id: ObjectId, // Thay thế ShippingID
  orderId: ObjectId, // Reference đến orders
  shippingMethod: String,
  trackingNumber: String,
  shippingFee: Number,
  estimatedDelivery: Date,
  actualDelivery: Date, // nullable
  status: String, // 'Preparing', 'In Transit', 'Delivered', 'Returned'
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 10. Carts Collection

```javascript
// Collection: carts
{
  _id: ObjectId, // Thay thế CartID
  customerId: ObjectId, // Reference đến customers
  // Embedded cart items
  items: [{
    productId: ObjectId, // Reference đến products
    quantity: Number,
    addedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### 11. FavoriteProducts Collection

```javascript
// Collection: favoriteProducts
{
  _id: ObjectId,
  customerId: ObjectId, // Reference đến customers
  productId: ObjectId, // Reference đến products
  createdAt: Date
}
```

## Indexes Recommendations

### Customers Collection

```javascript
db.customers.createIndex({ email: 1 }, { unique: true });
db.customers.createIndex({ phone: 1 });
```

### Products Collection

```javascript
db.products.createIndex({ categoryId: 1 });
db.products.createIndex({ productName: 'text', description: 'text' });
db.products.createIndex({ isFeatured: 1 });
db.products.createIndex({ createdAt: -1 });
```

### Orders Collection

```javascript
db.orders.createIndex({ customerId: 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ orderDate: -1 });
```

### Categories Collection

```javascript
db.categories.createIndex({ parentId: 1 });
db.categories.createIndex({ isActive: 1 });
```

### Reviews Collection

```javascript
db.reviews.createIndex({ productId: 1 });
db.reviews.createIndex({ customerId: 1 });
db.reviews.createIndex({ isApproved: 1 });
```

### Discounts Collection

```javascript
db.discounts.createIndex({ discountCode: 1 }, { unique: true });
db.discounts.createIndex({ isActive: 1 });
db.discounts.createIndex({ startDate: 1, endDate: 1 });
```

## Entity Relationship Diagram (ERD)

```
CUSTOMERS
├── _id (PK)
├── fullName
├── phone
├── email (Unique)
├── password
├── address
├── createdAt
└── updatedAt

ADMINS
├── _id (PK)
├── username
├── email
├── password
├── role
├── createdAt
└── lastLogin

CATEGORIES
├── _id (PK)
├── categoryName
├── description
├── parentId (FK → CATEGORIES._id)
├── isActive
├── createdAt
└── updatedAt

PRODUCTS
├── _id (PK)
├── productName
├── description
├── price
├── discountedPrice
├── weight
├── material
├── stockQuantity
├── categoryId (FK → CATEGORIES._id)
├── createdBy (FK → ADMINS._id)
├── isFeatured
├── views
├── discounts[] (Embedded)
├── createdAt
└── updatedAt

ORDERS
├── _id (PK)
├── customerId (FK → CUSTOMERS._id)
├── orderDate
├── totalAmount
├── discountAmount
├── finalAmount
├── status
├── shippingAddress
├── processedBy (FK → ADMINS._id)
├── notes
├── orderDetails[] (Embedded)
│   ├── productId (FK → PRODUCTS._id)
│   ├── quantity
│   ├── priceAtPurchase
│   └── discountApplied
├── appliedDiscounts[] (Embedded)
├── createdAt
└── updatedAt

PAYMENTS
├── _id (PK)
├── orderId (FK → ORDERS._id)
├── paymentMethod
├── paymentDate
├── amount
├── transactionCode
├── status
├── verifiedBy (FK → ADMINS._id)
└── createdAt

DISCOUNTS
├── _id (PK)
├── discountCode (Unique)
├── discountName
├── discountType
├── discountValue
├── startDate
├── endDate
├── minOrderValue
├── maxDiscountAmount
├── usageLimit
├── usedCount
├── isActive
├── createdBy (FK → ADMINS._id)
└── createdAt

REVIEWS
├── _id (PK)
├── productId (FK → PRODUCTS._id)
├── customerId (FK → CUSTOMERS._id)
├── orderId (FK → ORDERS._id)
├── rating
├── title
├── comment
├── reviewDate
├── isApproved
├── approvedBy (FK → ADMINS._id)
├── approvedAt
├── response
└── responseDate

SHIPPINGS
├── _id (PK)
├── orderId (FK → ORDERS._id)
├── shippingMethod
├── trackingNumber
├── shippingFee
├── estimatedDelivery
├── actualDelivery
├── status
├── notes
├── createdAt
└── updatedAt

CARTS
├── _id (PK)
├── customerId (FK → CUSTOMERS._id)
├── items[] (Embedded)
│   ├── productId (FK → PRODUCTS._id)
│   ├── quantity
│   └── addedAt
├── createdAt
└── updatedAt

FAVORITE_PRODUCTS
├── _id (PK)
├── customerId (FK → CUSTOMERS._id)
├── productId (FK → PRODUCTS._id)
└── createdAt
```

## Relationships Summary

### One-to-Many Relationships:

- **CUSTOMERS** → **ORDERS** (1:N)
- **CUSTOMERS** → **REVIEWS** (1:N)
- **CUSTOMERS** → **CARTS** (1:1)
- **ADMINS** → **PRODUCTS** (1:N) - createdBy
- **ADMINS** → **DISCOUNTS** (1:N) - createdBy
- **CATEGORIES** → **PRODUCTS** (1:N)
- **CATEGORIES** → **CATEGORIES** (1:N) - self-reference for subcategories
- **PRODUCTS** → **REVIEWS** (1:N)
- **ORDERS** → **PAYMENTS** (1:N)
- **ORDERS** → **SHIPPINGS** (1:1)

### Many-to-Many Relationships (handled via references):

- **CUSTOMERS** ↔ **PRODUCTS** (via FAVORITE_PRODUCTS)
- **PRODUCTS** ↔ **DISCOUNTS** (via embedded arrays)
- **ORDERS** ↔ **DISCOUNTS** (via embedded arrays)

### Embedded Relationships:

- **ORDERS** embeds **ORDER_DETAILS**
- **ORDERS** embeds **APPLIED_DISCOUNTS**
- **CARTS** embeds **CART_ITEMS**
- **PRODUCTS** embeds **DISCOUNTS** (applied discounts)

## Validation Rules

### Customers Collection Validation

```javascript
db.createCollection('customers', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['fullName', 'email', 'password'],
      properties: {
        fullName: {
          bsonType: 'string',
          minLength: 2,
          maxLength: 100,
          description: 'Tên đầy đủ là bắt buộc',
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'Email phải đúng định dạng',
        },
        phone: {
          bsonType: 'string',
          pattern: '^[0-9]{10,11}$',
          description: 'Số điện thoại phải 10-11 chữ số',
        },
        address: {
          bsonType: 'string',
          maxLength: 500,
        },
      },
    },
  },
});
```

### Products Collection Validation

```javascript
db.createCollection('products', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: [
        'productName',
        'price',
        'weight',
        'material',
        'stockQuantity',
        'categoryId',
      ],
      properties: {
        productName: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 200,
        },
        price: {
          bsonType: 'number',
          minimum: 0,
          description: 'Giá phải lớn hơn 0',
        },
        discountedPrice: {
          bsonType: 'number',
          minimum: 0,
        },
        weight: {
          bsonType: 'number',
          minimum: 0,
          description: 'Trọng lượng phải lớn hơn 0',
        },
        material: {
          bsonType: 'string',
          enum: [
            'Vàng 24k',
            'Vàng 18k',
            'Vàng 14k',
            'Bạc 925',
            'Bạc 999',
            'Kim cương',
            'Ngọc trai',
            'Đá quý',
          ],
          description: 'Chất liệu phải trong danh sách cho phép',
        },
        stockQuantity: {
          bsonType: 'int',
          minimum: 0,
        },
      },
    },
  },
});
```

### Orders Collection Validation

```javascript
db.createCollection('orders', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: [
        'customerId',
        'totalAmount',
        'finalAmount',
        'status',
        'orderDetails',
      ],
      properties: {
        totalAmount: {
          bsonType: 'number',
          minimum: 0,
        },
        discountAmount: {
          bsonType: 'number',
          minimum: 0,
        },
        finalAmount: {
          bsonType: 'number',
          minimum: 0,
        },
        status: {
          bsonType: 'string',
          enum: [
            'Pending',
            'Processing',
            'Shipped',
            'Delivered',
            'Cancelled',
            'Returned',
          ],
        },
        orderDetails: {
          bsonType: 'array',
          minItems: 1,
          items: {
            bsonType: 'object',
            required: ['productId', 'quantity', 'priceAtPurchase'],
            properties: {
              quantity: {
                bsonType: 'int',
                minimum: 1,
              },
              priceAtPurchase: {
                bsonType: 'number',
                minimum: 0,
              },
            },
          },
        },
      },
    },
  },
});
```

## Sample Data Examples

### Sample Categories

```javascript
// Danh mục gốc
db.categories.insertMany([
  {
    _id: ObjectId(),
    categoryName: 'Nhẫn',
    description: 'Các loại nhẫn trang sức',
    parentId: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: ObjectId(),
    categoryName: 'Vòng cổ',
    description: 'Các loại vòng cổ và dây chuyền',
    parentId: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: ObjectId(),
    categoryName: 'Bông tai',
    description: 'Các loại bông tai và khuyên tai',
    parentId: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);

// Danh mục con
db.categories.insertMany([
  {
    _id: ObjectId(),
    categoryName: 'Nhẫn Kim cương',
    description: 'Nhẫn đính kim cương',
    parentId: ObjectId('parent_ring_id'), // ID của category "Nhẫn"
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: ObjectId(),
    categoryName: 'Nhẫn Vàng',
    description: 'Nhẫn vàng các loại',
    parentId: ObjectId('parent_ring_id'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);
```

### Sample Products

```javascript
db.products.insertMany([
  {
    _id: ObjectId(),
    productName: 'Nhẫn Kim cương Solitaire 1 carat',
    description:
      'Nhẫn kim cương solitaire với viên kim cương 1 carat, thiết kế cổ điển sang trọng',
    price: 45000000,
    discountedPrice: 42000000,
    weight: 3.5,
    material: 'Vàng 18k',
    stockQuantity: 5,
    categoryId: ObjectId('diamond_ring_category_id'),
    createdBy: ObjectId('admin_id'),
    isFeatured: true,
    views: 1250,
    discounts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: ObjectId(),
    productName: 'Vòng cổ Ngọc trai Akoya',
    description: 'Vòng cổ ngọc trai Akoya cao cấp, độ bóng tuyệt đẹp',
    price: 8500000,
    discountedPrice: null,
    weight: 25.0,
    material: 'Ngọc trai',
    stockQuantity: 12,
    categoryId: ObjectId('necklace_category_id'),
    createdBy: ObjectId('admin_id'),
    isFeatured: false,
    views: 680,
    discounts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);
```

### Sample Customer

```javascript
db.customers.insertOne({
  _id: ObjectId(),
  fullName: 'Nguyễn Thị Hoa',
  phone: '0987654321',
  email: 'nguyenthihoa@email.com',
  password: '$2b$12$hashedPassword', // Password đã hash
  address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

## Common Queries Examples

### 1. Tìm sản phẩm theo danh mục

```javascript
// Tìm tất cả sản phẩm trong danh mục "Nhẫn"
db.products
  .find({
    categoryId: ObjectId('ring_category_id'),
  })
  .sort({ createdAt: -1 });
```

### 2. Tìm sản phẩm nổi bật có sẵn

```javascript
// Sản phẩm nổi bật và còn hàng
db.products
  .find({
    isFeatured: true,
    stockQuantity: { $gt: 0 },
  })
  .sort({ views: -1 });
```

### 3. Tìm đơn hàng theo trạng thái

```javascript
// Đơn hàng đang xử lý
db.orders
  .find({
    status: 'Processing',
  })
  .populate('customerId', 'fullName email');
```

### 4. Tìm sản phẩm theo khoảng giá

```javascript
// Sản phẩm từ 1-10 triệu
db.products.find({
  $or: [
    { discountedPrice: { $gte: 1000000, $lte: 10000000 } },
    {
      discountedPrice: null,
      price: { $gte: 1000000, $lte: 10000000 },
    },
  ],
  stockQuantity: { $gt: 0 },
});
```

### 5. Thống kê doanh thu theo tháng

```javascript
// Doanh thu tháng hiện tại
db.orders.aggregate([
  {
    $match: {
      status: 'Delivered',
      orderDate: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      },
    },
  },
  {
    $group: {
      _id: null,
      totalRevenue: { $sum: '$finalAmount' },
      totalOrders: { $sum: 1 },
    },
  },
]);
```

### 6. Tìm khách hàng VIP (mua nhiều nhất)

```javascript
db.orders.aggregate([
  {
    $match: { status: 'Delivered' },
  },
  {
    $group: {
      _id: '$customerId',
      totalSpent: { $sum: '$finalAmount' },
      orderCount: { $sum: 1 },
    },
  },
  {
    $sort: { totalSpent: -1 },
  },
  {
    $limit: 10,
  },
  {
    $lookup: {
      from: 'customers',
      localField: '_id',
      foreignField: '_id',
      as: 'customer',
    },
  },
]);
```

### 7. Sản phẩm bán chạy nhất

```javascript
db.orders.aggregate([
  { $unwind: '$orderDetails' },
  {
    $group: {
      _id: '$orderDetails.productId',
      totalSold: { $sum: '$orderDetails.quantity' },
      revenue: {
        $sum: {
          $multiply: [
            '$orderDetails.quantity',
            '$orderDetails.priceAtPurchase',
          ],
        },
      },
    },
  },
  { $sort: { totalSold: -1 } },
  { $limit: 10 },
  {
    $lookup: {
      from: 'products',
      localField: '_id',
      foreignField: '_id',
      as: 'product',
    },
  },
]);
```

## Performance Considerations

### 1. Connection Pooling

```javascript
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(uri, {
  maxPoolSize: 50, // Maintain up to 50 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
});
```

### 2. Aggregation Pipeline Optimization

```javascript
// Đưa $match lên đầu để giảm số document cần xử lý
db.orders.aggregate([
  { $match: { status: 'Delivered' } }, // Filter trước
  { $unwind: '$orderDetails' },
  { $group: { _id: '$customerId', total: { $sum: '$finalAmount' } } },
]);
```

### 3. Projection để giảm bandwidth

```javascript
// Chỉ lấy field cần thiết
db.products.find(
  { stockQuantity: { $gt: 0 } },
  { productName: 1, price: 1, discountedPrice: 1, material: 1 },
);
```

### 4. Compound Indexes cho queries phức tạp

```javascript
// Index composite cho tìm kiếm sản phẩm
db.products.createIndex({
  categoryId: 1,
  stockQuantity: 1,
  price: 1,
});

// Index cho orders
db.orders.createIndex({
  customerId: 1,
  status: 1,
  orderDate: -1,
});
```

## Security Best Practices

### 1. Password Security

```javascript
const bcrypt = require('bcrypt');

// Hash password trước khi lưu
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Verify password
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
```

### 2. Input Validation và Sanitization

```javascript
const validator = require('validator');

// Validate email
const isValidEmail = (email) => {
  return validator.isEmail(email);
};

// Sanitize input
const sanitizeInput = (input) => {
  return validator.escape(input.trim());
};
```

### 3. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});
```

### 4. Authentication và Authorization

```javascript
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });
};

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(
    token.replace('Bearer ', ''),
    process.env.JWT_SECRET,
    (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ message: 'Failed to authenticate token' });
      }
      req.userId = decoded.userId;
      req.userRole = decoded.role;
      next();
    },
  );
};
```

## Migration Scripts

### 1. Initial Database Setup

```javascript
// setup-database.js
const { MongoClient } = require('mongodb');

async function setupDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('jewelry-shop');

    // Create collections với validation
    await createCollectionsWithValidation(db);

    // Create indexes
    await createIndexes(db);

    // Insert initial data
    await insertInitialData(db);

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    await client.close();
  }
}

async function createIndexes(db) {
  // Customers indexes
  await db.collection('customers').createIndex({ email: 1 }, { unique: true });
  await db.collection('customers').createIndex({ phone: 1 });

  // Products indexes
  await db.collection('products').createIndex({ categoryId: 1 });
  await db
    .collection('products')
    .createIndex({ productName: 'text', description: 'text' });
  await db.collection('products').createIndex({ isFeatured: 1 });
  await db.collection('products').createIndex({ createdAt: -1 });

  // Orders indexes
  await db.collection('orders').createIndex({ customerId: 1 });
  await db.collection('orders').createIndex({ status: 1 });
  await db.collection('orders').createIndex({ orderDate: -1 });

  // Other indexes...
}

setupDatabase();
```

### 2. Data Migration Script

```javascript
// migrate-data.js
async function migrateFromSQL() {
  // Script để migrate data từ SQL sang MongoDB
  // Xử lý foreign key relationships
  // Convert data types
  // Handle embedded documents
}
```

## Environment Configuration

### 1. Database Connection Config

```javascript
// config/database.js
module.exports = {
  development: {
    uri: process.env.MONGODB_URI_DEV,
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },
  production: {
    uri: process.env.MONGODB_URI_PROD,
    options: {
      maxPoolSize: 50,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      ssl: true,
      retryWrites: true,
      w: 'majority',
    },
  },
};
```

### 2. Environment Variables

```bash
# .env file
MONGODB_URI=mongodb+srv://dangtienhungdev:Htm%4023624@jewelry-shop.v2r4ocu.mongodb.net/?retryWrites=true&w=majority&appName=jewelry-shop
JWT_SECRET=your-super-secret-jwt-key
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret
```

## Notes:

1. Sử dụng ObjectId thay vì auto-increment integers
2. Embedded documents để tối ưu hiệu suất truy vấn
3. Reference relationships cho các quan hệ phức tạp
4. Indexes được tối ưu cho các truy vấn thường xuyên
5. Timestamp tự động với createdAt/updatedAt
6. Validation rules đảm bảo data integrity
7. Security best practices cho authentication và authorization
8. Performance optimization với connection pooling và proper indexing
