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
    
    // 프로덕션에서는 synchronize를 false로 설정 (마이그레이션 사용)
    synchronize: !isProduction,
    
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
      acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000', 10),
      timeout: parseInt(process.env.DB_TIMEOUT || '60000', 10),
      reconnect: true,
      // MySQL 특정 설정
      ...(isProduction && {
        ssl: { rejectUnauthorized: false },
        // 프로덕션 최적화 설정
        supportBigNumbers: true,
        bigNumberStrings: false,
        dateStrings: false,
        debug: false,
        trace: false,
      }),
    },
    
    // 연결 재시도 설정
    retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '10', 10),
    retryDelay: parseInt(process.env.DB_RETRY_DELAY || '3000', 10),
    
    // 연결 타임아웃 설정
    connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '60000', 10),
    
    // 마이그레이션 설정 (프로덕션에서 사용)
    migrations: isProduction ? [__dirname + '/../migrations/*{.ts,.js}'] : undefined,
    migrationsRun: isProduction,
    migrationsTableName: 'migrations',
  };
});
