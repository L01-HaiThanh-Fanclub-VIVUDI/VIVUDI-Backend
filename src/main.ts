import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('VIVUDI API')
    .setDescription('API documentation for VIVUDI Backend')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .addTag('health', 'Health check endpoints')
    .addTag('auth', 'Authentication endpoints')
    .addTag('post', 'Post management endpoints')
    .addTag('comment', 'Comment management endpoints')
    .addTag('position', 'Position management endpoints')
    .addTag('google-drive', 'Google Drive file management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  
  // Get base URL from environment or use default
  const baseUrl = process.env.APP_URL || 
                  process.env.RENDER_EXTERNAL_URL || 
                  `https://vivudi-backend-wh0z.onrender.com`;
  
  console.log(`🚀 Application is running on: ${baseUrl}`);
  console.log(`📚 Swagger documentation: ${baseUrl}/api`);
}
bootstrap();
