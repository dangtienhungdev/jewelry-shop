import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'default-jwt-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'default-refresh-secret',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },

  // Bcrypt Configuration
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  },

  // Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
    uploadPath: process.env.UPLOAD_PATH || 'uploads',
  },

  // Rate Limiting
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
    limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100', 10),
  },

  // Swagger Configuration
  swagger: {
    title: process.env.SWAGGER_TITLE || 'Jewelry Shop API',
    description:
      process.env.SWAGGER_DESCRIPTION ||
      'API documentation for Jewelry Shop e-commerce platform',
    version: process.env.SWAGGER_VERSION || '1.0.0',
    tag: process.env.SWAGGER_TAG || 'jewelry-shop',
  },

  // Email Configuration
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'jewelry-shop@email.com',
  },

  // Payment Configuration
  payment: {
    vnpay: {
      tmnCode: process.env.VNPAY_TMN_CODE || '',
      hashSecret: process.env.VNPAY_HASH_SECRET || '',
      url:
        process.env.VNPAY_URL ||
        'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      returnUrl:
        process.env.VNPAY_RETURN_URL ||
        'http://localhost:3000/api/v1/payment/vnpay/return',
    },
  },
}));
