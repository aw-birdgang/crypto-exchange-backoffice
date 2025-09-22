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
      transformOptions: {
        enableImplicitConversion: false, // 자동 변환 비활성화
      },
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

  // Swagger 설정 (환경별 구분)
  const { SwaggerConfig } = await import('./common/config/swagger.config');
  SwaggerConfig.setup(app);

  const port = configService.get<number>('app.port') || 3001;
  await app.listen(port);

  // 환경별 Swagger 경로 설정
  const nodeEnv = configService.get<string>('app.nodeEnv') || 'development';
  let docsPath = '/api-docs';
  let externalPort = port;

  if (nodeEnv === 'staging') {
    docsPath = '/staging/api-docs';
    externalPort = 3002; // Docker 포트 매핑
  } else if (nodeEnv === 'production') {
    docsPath = '/prod/api-docs';
    externalPort = 3004; // Docker 포트 매핑
  }

  console.log(`🚀 API Server is running env :${nodeEnv}`);
  console.log(`🚀 API Server is running on: http://localhost:${externalPort} (internal)`);
  console.log(`🌐 External access: http://localhost:${externalPort}`);
  console.log(`📚 API Documentation: http://localhost:${externalPort}${docsPath}`);
  console.log(`🔐 Test Authentication: POST http://localhost:${externalPort}/auth/login`);
}

bootstrap();
