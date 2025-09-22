import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'crypto_exchange',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    
    // 모든 환경에서 synchronize 활성화 (개발/테스트용)
    synchronize: true,
    
    // 로깅 설정
    logging: isDevelopment ? ['query', 'error', 'warn'] : ['error'],
    
    // SSL 설정
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    
    // 문자셋 및 타임존
    charset: 'utf8mb4',
    timezone: 'Z',
    
    // 연결 풀 설정
    extra: {
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
      // MySQL2에서 지원하는 옵션만 사용
      supportBigNumbers: true,
      bigNumberStrings: false,
      dateStrings: false,
      debug: false,
      trace: false,
      // MySQL 특정 설정
      ...(isProduction && {
        ssl: { rejectUnauthorized: false },
      }),
    },
    
    // 연결 재시도 설정
    retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '10', 10),
    retryDelay: parseInt(process.env.DB_RETRY_DELAY || '3000', 10),
    
    // 연결 타임아웃 설정
    connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '60000', 10),
    
    // 마이그레이션 설정 (개발용으로 비활성화)
    // migrations: isProduction ? [__dirname + '/../migrations/*{.ts,.js}'] : undefined,
    // migrationsRun: isProduction,
    // migrationsTableName: 'migrations',
  };
});
