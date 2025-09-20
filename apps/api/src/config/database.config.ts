import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'crypto_exchange',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // 개발 환경에서 엔티티 기반 자동 스키마 관리
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  charset: 'utf8mb4',
  timezone: 'Z',
  // 연결 재시도 설정
  retryAttempts: 10,
  retryDelay: 3000,
  // 연결 타임아웃 설정
  connectTimeout: 60000,
}));
