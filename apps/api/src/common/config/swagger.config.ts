import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Swagger 설정 - 환경별 구분
 */
export class SwaggerConfig {
  static setup(app: INestApplication) {
    const configService = app.get(ConfigService);
    const nodeEnv = configService.get('NODE_ENV') || 'development';
    const port = configService.get('PORT') || 3001;
    const host = configService.get('HOST') || 'localhost';
    
    // 환경별 서버 URL 설정
    const devServerUrl = configService.get('DEV_SERVER_URL') || `http://${host}:3001`;
    const stagingServerUrl = configService.get('STAGING_SERVER_URL') || `http://${host}:3002`;
    const prodServerUrl = configService.get('PROD_SERVER_URL') || `http://${host}:3004`;
    
    // 현재 환경에 맞는 서버 URL 설정
    let currentServerUrl = devServerUrl;
    if (nodeEnv === 'staging') {
      currentServerUrl = stagingServerUrl;
    } else if (nodeEnv === 'production') {
      currentServerUrl = prodServerUrl;
    }
    
    // 환경별 설정
    const envConfig = this.getEnvironmentConfig(nodeEnv, host, port, {
      devServerUrl,
      stagingServerUrl,
      prodServerUrl
    });
    
    const config = new DocumentBuilder()
      .setTitle(envConfig.title)
      .setDescription(envConfig.description)
      .setVersion(envConfig.version)
      .setContact(envConfig.contact.name, envConfig.contact.url, envConfig.contact.email)
      .setLicense(envConfig.license.name, envConfig.license.url)
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
      .addServer(currentServerUrl, `${nodeEnv.toUpperCase()} Server`)
      .addServer(envConfig.servers.development.url, envConfig.servers.development.description)
      .addServer(envConfig.servers.staging.url, envConfig.servers.staging.description)
      .addServer(envConfig.servers.production.url, envConfig.servers.production.description)
      .build();

    const document = SwaggerModule.createDocument(app, config);
    
    // Swagger UI 설정
    SwaggerModule.setup(envConfig.docsPath, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        showRequestHeaders: true,
        showCommonExtensions: true,
        tryItOutEnabled: true,
        // 현재 환경의 서버 URL을 기본값으로 설정
        url: `${currentServerUrl}/api-docs-json`,
      },
      customSiteTitle: envConfig.customSiteTitle,
      customfavIcon: '/favicon.ico',
      customCss: envConfig.customCss,
    });

    console.log(`📚 API Documentation (${nodeEnv.toUpperCase()}): http://${host}:${port}${envConfig.docsPath}`);
  }

  /**
   * 환경별 설정 반환
   */
  private static getEnvironmentConfig(
    nodeEnv: string, 
    host: string, 
    port: number, 
    serverUrls: {
      devServerUrl: string;
      stagingServerUrl: string;
      prodServerUrl: string;
    }
  ) {
    const baseUrl = `http://${host}:${port}`;
    
    switch (nodeEnv) {
      case 'development':
        return {
          title: 'Crypto Exchange API - Development',
          description: '암호화폐 거래소 백오피스 API 문서 (개발환경)',
          version: '2.0.0-dev',
          docsPath: '/api-docs',
          customSiteTitle: 'Crypto Exchange API Docs - Development',
          contact: {
            name: 'Development Team',
            url: 'https://dev.crypto-exchange.com',
            email: 'dev@crypto-exchange.com'
          },
          license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
          },
          servers: {
            development: {
              url: serverUrls.devServerUrl,
              description: 'Development Server'
            },
            staging: {
              url: serverUrls.stagingServerUrl,
              description: 'Staging Server'
            },
            production: {
              url: serverUrls.prodServerUrl,
              description: 'Production Server'
            }
          },
          customCss: `
            .swagger-ui .topbar { display: none; }
            .swagger-ui .info .title { color: #10b981; }
            .swagger-ui .scheme-container { 
              background: #f0fdf4; 
              padding: 20px; 
              border-radius: 8px; 
              border-left: 4px solid #10b981;
            }
            .swagger-ui .info .title::after {
              content: " (Development)";
              color: #10b981;
              font-size: 0.8em;
              font-weight: normal;
            }
          `
        };

      case 'staging':
        return {
          title: 'Crypto Exchange API - Staging',
          description: '암호화폐 거래소 백오피스 API 문서 (스테이징환경)',
          version: '2.0.0-staging',
          docsPath: '/staging/api-docs',
          customSiteTitle: 'Crypto Exchange API Docs - Staging',
          contact: {
            name: 'Staging Team',
            url: 'https://staging.crypto-exchange.com',
            email: 'staging@crypto-exchange.com'
          },
          license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
          },
          servers: {
            development: {
              url: serverUrls.devServerUrl,
              description: 'Development Server'
            },
            staging: {
              url: serverUrls.stagingServerUrl,
              description: 'Staging Server'
            },
            production: {
              url: serverUrls.prodServerUrl,
              description: 'Production Server'
            }
          },
          customCss: `
            .swagger-ui .topbar { display: none; }
            .swagger-ui .info .title { color: #f59e0b; }
            .swagger-ui .scheme-container { 
              background: #fffbeb; 
              padding: 20px; 
              border-radius: 8px; 
              border-left: 4px solid #f59e0b;
            }
            .swagger-ui .info .title::after {
              content: " (Staging)";
              color: #f59e0b;
              font-size: 0.8em;
              font-weight: normal;
            }
          `
        };

      case 'production':
        return {
          title: 'Crypto Exchange API - Production',
          description: '암호화폐 거래소 백오피스 API 문서 (운영환경)',
          version: '2.0.0',
          docsPath: '/prod/api-docs',
          customSiteTitle: 'Crypto Exchange API Docs - Production',
          contact: {
            name: 'Production Team',
            url: 'https://crypto-exchange.com',
            email: 'support@crypto-exchange.com'
          },
          license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
          },
          servers: {
            development: {
              url: serverUrls.devServerUrl,
              description: 'Development Server'
            },
            staging: {
              url: serverUrls.stagingServerUrl,
              description: 'Staging Server'
            },
            production: {
              url: serverUrls.prodServerUrl,
              description: 'Production Server'
            }
          },
          customCss: `
            .swagger-ui .topbar { display: none; }
            .swagger-ui .info .title { color: #dc2626; }
            .swagger-ui .scheme-container { 
              background: #fef2f2; 
              padding: 20px; 
              border-radius: 8px; 
              border-left: 4px solid #dc2626;
            }
            .swagger-ui .info .title::after {
              content: " (Production)";
              color: #dc2626;
              font-size: 0.8em;
              font-weight: normal;
            }
          `
        };

      default:
        return {
          title: 'Crypto Exchange API',
          description: '암호화폐 거래소 백오피스 API 문서',
          version: '2.0.0',
          docsPath: '/api-docs',
          customSiteTitle: 'Crypto Exchange API Docs',
          contact: {
            name: 'Crypto Exchange Team',
            url: 'https://crypto-exchange.com',
            email: 'support@crypto-exchange.com'
          },
          license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
          },
          servers: {
            development: {
              url: serverUrls.devServerUrl,
              description: 'Development Server'
            },
            staging: {
              url: serverUrls.stagingServerUrl,
              description: 'Staging Server'
            },
            production: {
              url: serverUrls.prodServerUrl,
              description: 'Production Server'
            }
          },
          customCss: `
            .swagger-ui .topbar { display: none; }
            .swagger-ui .info .title { color: #3b82f6; }
            .swagger-ui .scheme-container { 
              background: #f8fafc; 
              padding: 20px; 
              border-radius: 8px; 
              border-left: 4px solid #3b82f6;
            }
          `
        };
    }
  }
}
