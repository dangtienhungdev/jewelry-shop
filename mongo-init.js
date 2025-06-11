// MongoDB initialization script
print('Bắt đầu khởi tạo MongoDB...');

// Chuyển đến database jewelry-shop
db = db.getSiblingDB('jewelry-shop');

// Tạo collections cần thiết
db.createCollection('products');
db.createCollection('categories');
db.createCollection('users');
db.createCollection('orders');
db.createCollection('customers');

print('Đã tạo collections: products, categories, users, orders, customers');

// Tạo indexes cho products
db.products.createIndex({ "productName": "text", "description": "text" });
db.products.createIndex({ "categoryId": 1 });
db.products.createIndex({ "price": 1 });
db.products.createIndex({ "isFeatured": 1 });
db.products.createIndex({ "material": 1 });
db.products.createIndex({ "createdAt": -1 });

// Tạo indexes cho categories
db.categories.createIndex({ "categoryName": 1 }, { unique: true });

// Tạo indexes cho users
db.users.createIndex({ "email": 1 }, { unique: true });

// Tạo indexes cho orders
db.orders.createIndex({ "customerId": 1 });
db.orders.createIndex({ "orderDate": -1 });
db.orders.createIndex({ "status": 1 });

// Tạo indexes cho customers
db.customers.createIndex({ "email": 1 }, { unique: true });

print('Đã tạo indexes cho tất cả collections');

// Thêm dữ liệu mẫu cho categories
db.categories.insertMany([
  {
    categoryName: "Nhẫn",
    description: "Các loại nhẫn trang sức cao cấp",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    categoryName: "Dây chuyền",
    description: "Dây chuyền và mặt dây chuyền",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    categoryName: "Bông tai",
    description: "Bông tai và khuyên tai thời trang",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    categoryName: "Lắc tay",
    description: "Lắc tay và vòng tay đẹp",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('Đã thêm 4 categories mẫu');

// Tạo user cho ứng dụng
db.createUser({
  user: "jewelryapp",
  pwd: "jewelryapp123",
  roles: [
    {
      role: "readWrite",
      db: "jewelry-shop"
    }
  ]
});

print('Đã tạo user jewelryapp với quyền readWrite');
print('MongoDB khởi tạo hoàn tất!');