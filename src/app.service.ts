import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      message: 'Jewelry Shop API is running!',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  getHealth(): object {
    const memoryUsage = process.memoryUsage();

    return {
      status: 'ok',
      database: 'connected', // This will be updated when database connection is checked
      uptime: process.uptime(),
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // Convert to MB
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // Convert to MB
      },
      timestamp: new Date().toISOString(),
    };
  }
}
