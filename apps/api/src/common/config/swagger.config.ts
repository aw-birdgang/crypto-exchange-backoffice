import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

/**
 * Swagger 설정
 */
export class SwaggerConfig {
  static setup(app: INestApplication) {
    const config = new DocumentBuilder()
      .setTitle('Crypto Exchange API')
      .setDescription('암호화폐 거래소 백오피스 API 문서')
      .setVersion('1.0.0')
      .addTag('Authentication', '인증 관련 API')
      .addTag('Admin', '관리자 관련 API')
      .addTag('Permissions', '권한 관리 API')
      .addTag('Health', '헬스체크 API')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'JWT 토큰을 입력하세요',
          in: 'header',
        },
        'JWT-auth'
      )
      .addServer('http://localhost:3001', 'Development Server')
      .addServer('https://api.crypto-exchange.com', 'Production Server')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    
    // Swagger UI 설정
    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        showRequestHeaders: true,
        showCommonExtensions: true,
        tryItOutEnabled: true,
      },
      customSiteTitle: 'Crypto Exchange API Docs',
      customfavIcon: '/favicon.ico',
      customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info .title { color: #3b82f6; }
        .swagger-ui .scheme-container { background: #f8fafc; padding: 20px; border-radius: 8px; }
      `,
    });

    console.log('📚 API Documentation: http://localhost:3001/api-docs');
  }
}
