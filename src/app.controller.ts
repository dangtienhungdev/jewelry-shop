import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health Check')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Application is running successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Jewelry Shop API is running!' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        version: { type: 'string', example: '1.0.0' },
        environment: { type: 'string', example: 'development' },
      },
    },
  })
  getHello(): object {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Detailed health check' })
  @ApiResponse({
    status: 200,
    description: 'Detailed health information',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        database: { type: 'string', example: 'connected' },
        uptime: { type: 'number', example: 123.456 },
        memory: {
          type: 'object',
          properties: {
            used: { type: 'number' },
            total: { type: 'number' },
          },
        },
      },
    },
  })
  getHealth(): object {
    return this.appService.getHealth();
  }
}
