import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS 설정
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Crypto Exchange API')
    .setDescription(`
      암호화폐 거래소 백오피스 API 문서
      
      ## 인증 방법
      1. 로그인 API를 통해 JWT 토큰을 받습니다
      2. 상단의 "Authorize" 버튼을 클릭합니다
      3. "Bearer {your-token}" 형식으로 토큰을 입력합니다
      
      ## 테스트 방법
      - 각 API의 "Try it out" 버튼을 클릭하여 테스트할 수 있습니다
      - 인증이 필요한 API는 먼저 로그인하여 토큰을 받아주세요
    `)
    .setVersion('1.0.0')
    .setContact('Crypto Exchange Team', 'https://crypto-exchange.com', 'support@crypto-exchange.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3001', 'Development Server')
    .addServer('https://api.crypto-exchange.com', 'Production Server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token (Bearer {token})',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .addTag('Authentication', '사용자 인증 관련 API')
    .addTag('Permissions', '권한 및 역할 관리 API')
    .addTag('Admin', '관리자 전용 API')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      docExpansion: 'none',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
    },
    customSiteTitle: 'Crypto Exchange API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #3b82f6; }
      .swagger-ui .scheme-container { background: #f8fafc; padding: 20px; border-radius: 8px; }
    `,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 API Server is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
  console.log(`🔐 Test Authentication: POST http://localhost:${port}/auth/login`);
}

bootstrap();
