import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 보안 헤더 설정
  app.use(helmet({
    contentSecurityPolicy: false, // Swagger UI를 위해 비활성화
    crossOriginEmbedderPolicy: false,
  }));

  // 압축 미들웨어 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    try {
      const compression = require('compression');
      app.use(compression());
    } catch (error) {
      console.warn('Compression middleware not available:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS 설정
  const corsConfig = configService.get('app.cors');
  app.enableCors(corsConfig);

  // 글로벌 API 버전 설정
  app.setGlobalPrefix('api/v1', {
    exclude: ['/health', '/api-docs', '/api-docs-json'],
  });

  // 쿠키 파싱을 위한 최적화된 미들웨어
  app.use((req: any, res: any, next: any) => {
    // 쿠키가 있는 경우에만 파싱
    if (req.headers.cookie && !req.cookies) {
      const cookies: { [key: string]: string } = {};
      const cookieString = req.headers.cookie;
      
      // 정규식을 사용한 더 효율적인 파싱
      const cookieRegex = /([^=]+)=([^;]*)/g;
      let match;
      
      while ((match = cookieRegex.exec(cookieString)) !== null) {
        const [, name, value] = match;
        if (name && value) {
          cookies[name.trim()] = decodeURIComponent(value.trim());
        }
      }
      
      req.cookies = cookies;
    }
    next();
  });

  // 스웨거 요청을 위한 전용 미들웨어 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    app.use('/api-docs', (req: any, res: any, next: any) => {
      console.log('🔍 Swagger Middleware - Request:', {
        method: req.method,
        url: req.url,
        headers: req.headers,
        authorization: req.headers.authorization || req.headers.Authorization
      });
      next();
    });
  }

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Crypto Exchange API')
    .setDescription('암호화폐 거래소 백오피스 API 문서')
    .setVersion('2.0.0')
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
        description: 'Enter JWT token (Bearer 접두사 없이 토큰만 입력)',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', '사용자 인증 관련 API')
    .addTag('Permissions', '권한 및 역할 관리 API')
    .addTag('Admin', '관리자 전용 API')
    .addTag('Health', '헬스체크 및 모니터링 API')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showRequestHeaders: true,
      showCommonExtensions: true,
      docExpansion: 'none',
      tryItOutEnabled: true,
    },
    customSiteTitle: 'Crypto Exchange API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #3b82f6; }
      .swagger-ui .scheme-container { background: #f8fafc; padding: 20px; border-radius: 8px; }
    `,
  });

  const port = configService.get<number>('app.port') || 3001;
  await app.listen(port);

  console.log(`🚀 API Server is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
  console.log(`🔐 Test Authentication: POST http://localhost:${port}/auth/login`);
}

bootstrap();
