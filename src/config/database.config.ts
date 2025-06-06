import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: process.env.MONGODB_URI,
  name: process.env.DB_NAME || 'jewelry-shop',
  options: {
    retryWrites: true,
    w: 'majority',
    maxPoolSize: process.env.NODE_ENV === 'production' ? 50 : 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
    bufferCommands: false,
  },
}));
