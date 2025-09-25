import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {JwtModule} from '@nestjs/jwt';
import {APP_FILTER, APP_GUARD, APP_INTERCEPTOR} from '@nestjs/core';
import {AuthModule} from './features/auth/presentation/auth.module';
import {AuditLogModule} from './features/audit-log/presentation/audit-log.module';
import {HttpExceptionFilter} from './common/exceptions/http-exception.filter';
import {ResponseInterceptor} from './common/interceptors/response.interceptor';
import {CacheModule} from './common/cache/cache.module';
import {LoggerModule} from './common/logger/logger.module';
import {HealthModule} from './common/health/health.module';
import {LoggingMiddleware, RequestIdMiddleware, CorsMiddleware, SecurityMiddleware, ApiVersionMiddleware} from './common/middleware';
import {RateLimitGuard} from './common/guards/rate-limit.guard';
import {PerformanceInterceptor} from './common/interceptors/performance.interceptor';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import {validationSchema} from './config/validation.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, databaseConfig, jwtConfig],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
          TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => configService.get('database')!,
            inject: [ConfigService],
          }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('jwt')!,
      inject: [ConfigService],
    }),
    CacheModule,
    LoggerModule,
    HealthModule,
    AuthModule,
    AuditLogModule,
  ],
  providers: [
    // JWT 가드를 전역에서 제거하고 각 컨트롤러에서 개별적으로 적용
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
  ],
  exports: [JwtModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiVersionMiddleware, RequestIdMiddleware, SecurityMiddleware, CorsMiddleware, LoggingMiddleware)
      .forRoutes('*');
  }
}
