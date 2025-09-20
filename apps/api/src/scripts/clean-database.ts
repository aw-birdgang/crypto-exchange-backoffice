#!/usr/bin/env ts-node

/**
 * 데이터베이스 정리 스크립트
 * 실행: npm run clean:db
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getConnection } from 'typeorm';

async function cleanDatabase() {
  let app;
  
  try {
    console.log('🚀 Starting database cleanup...');
    
    // NestJS 애플리케이션 생성
    app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['log', 'error', 'warn'],
    });
    
    // TypeORM 연결 가져오기
    const connection = getConnection();
    
    console.log('✅ Connected to database successfully');
    
    // 1. 잘못된 데이터 확인
    console.log('🔍 Checking for invalid data...');
    const invalidRoles = await connection.query(`
      SELECT * FROM roles WHERE name = '' OR name IS NULL
    `);
    console.log(`Found ${invalidRoles.length} invalid roles`);
    
    // 2. 잘못된 데이터 삭제
    if (invalidRoles.length > 0) {
      console.log('🗑️ Deleting invalid roles...');
      await connection.query(`
        DELETE FROM roles WHERE name = '' OR name IS NULL
      `);
      console.log('✅ Invalid roles deleted');
    }
    
    // 3. 중복된 빈 문자열 확인 및 삭제
    const duplicateEmpty = await connection.query(`
      SELECT name, COUNT(*) as count 
      FROM roles 
      WHERE name = '' 
      GROUP BY name 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateEmpty.length > 0) {
      console.log('🗑️ Deleting duplicate empty strings...');
      await connection.query(`
        DELETE FROM roles WHERE name = '' LIMIT 1
      `);
      console.log('✅ Duplicate empty strings deleted');
    }
    
    // 4. 테이블 상태 확인
    console.log('📊 Current roles table status:');
    const roles = await connection.query(`
      SELECT name, COUNT(*) as count 
      FROM roles 
      GROUP BY name 
      ORDER BY name
    `);
    
    roles.forEach((role: any) => {
      console.log(`  - ${role.name || '(empty)'}: ${role.count} records`);
    });
    
    console.log('✅ Database cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    process.exit(1);
  } finally {
    if (app) {
      await app.close();
    }
  }
}

cleanDatabase();
