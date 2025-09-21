#!/usr/bin/env ts-node

/**
 * 환경변수가 포함된 데이터베이스 초기화 스크립트
 * 실행: pnpm init:db
 */

// 환경변수 설정
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '3306';
process.env.DB_USERNAME = process.env.DB_USERNAME || 'crypto_user';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'password';
process.env.DB_DATABASE = process.env.DB_DATABASE || 'crypto_exchange';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// 기존 초기화 스크립트 실행
import './init-database';
