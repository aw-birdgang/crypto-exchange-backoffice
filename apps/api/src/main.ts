import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

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

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Crypto Exchange API')
    .setDescription(`
      암호화폐 거래소 백오피스 API 문서
      
      ## 🚀 주요 기능
      - **JWT 기반 인증**: Access Token + Refresh Token 방식
      - **RBAC 권한 관리**: 역할 기반 접근 제어
      - **Rate Limiting**: API 요청 제한 (100 req/15min)
      - **Redis 캐싱**: 성능 최적화를 위한 캐싱
      - **구조화된 로깅**: JSON 형태의 로그 출력
      - **헬스체크**: Kubernetes 호환 헬스체크 엔드포인트
      
      ## 🔐 인증 방법
      1. **회원가입**: POST /auth/register
      2. **로그인**: POST /auth/login
      3. **토큰 사용**: 상단의 "Authorize" 버튼 클릭 후 "Bearer {your-token}" 입력
      4. **토큰 갱신**: POST /auth/refresh
      
      ## 📊 모니터링
      - **헬스체크**: GET /health
      - **상세 상태**: GET /health/detailed
      - **Kubernetes**: GET /health/ready, GET /health/live
      
      ## 🛡️ 보안 기능
      - **Rate Limiting**: DDoS 방지를 위한 요청 제한
      - **CORS**: 안전한 크로스 오리진 요청
      - **Helmet**: 보안 헤더 자동 설정
      - **입력 검증**: XSS, SQL Injection 방지
      
      ## 🧪 테스트 방법
      - 각 API의 "Try it out" 버튼을 클릭하여 테스트
      - 인증이 필요한 API는 먼저 로그인하여 토큰을 받아주세요
      - 에러 응답은 구조화된 형태로 반환됩니다
      
      ## 📈 성능 최적화
      - **Redis 캐싱**: 자주 사용되는 데이터 캐싱
      - **데이터베이스 인덱스**: 쿼리 성능 최적화
      - **응답 압축**: Gzip 압축으로 네트워크 최적화
      - **연결 풀링**: 데이터베이스 연결 최적화
    `)
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
        description: 'Enter JWT token (Bearer {token})',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', '사용자 인증 관련 API')
    .addTag('Permissions', '권한 및 역할 관리 API')
    .addTag('Admin', '관리자 전용 API')
    .addTag('Health', '헬스체크 및 모니터링 API')
    .addTag('Security', '보안 관련 API')
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

  const port = configService.get<number>('app.port') || 3001;
  await app.listen(port);

  console.log(`🚀 API Server is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
  console.log(`🔐 Test Authentication: POST http://localhost:${port}/auth/login`);
}

bootstrap();
