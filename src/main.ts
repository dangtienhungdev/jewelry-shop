import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Methods',
    ],
  });

  // Global prefix
  app.setGlobalPrefix(configService.get('app.apiPrefix') || 'api/v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger configuration
  // const swaggerConfig = configService.get('app.swagger');
  // const config = new DocumentBuilder()
  //   .setTitle(swaggerConfig.title)
  //   .setDescription(swaggerConfig.description)
  //   .setVersion(swaggerConfig.version)
  //   .addTag(swaggerConfig.tag)
  //   .addBearerAuth(
  //     {
  //       type: 'http',
  //       scheme: 'bearer',
  //       bearerFormat: 'JWT',
  //       name: 'JWT',
  //       description: 'Enter JWT token',
  //       in: 'header',
  //     },
  //     'JWT-auth',
  //   )
  //   .addServer('http://localhost:8000', 'Development server')
  //   .addServer('https://api.jewelry-shop.com', 'Production server')
  //   .build();
  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api/docs', app, document, {
  //   swaggerOptions: {
  //     persistAuthorization: true,
  //     tagsSorter: 'alpha',
  //     operationsSorter: 'alpha',
  //   },
  //   customSiteTitle: 'Jewelry Shop API Documentation',
  //   customfavIcon: '/favicon.ico',
  //   customCss: `
  //     .swagger-ui .topbar { display: none }
  //     .swagger-ui .info .title { color: #d4af37 }
  //   `,
  // });

  const port = configService.get('app.port');
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  console.log(`🌍 Environment: ${configService.get('app.nodeEnv')}`);
}

bootstrap();
