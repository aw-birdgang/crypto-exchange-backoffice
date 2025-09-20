#!/usr/bin/env node

/**
 * 데이터베이스 완전 초기화 스크립트
 * 모든 테이블을 삭제하고 다시 생성
 */

const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USERNAME || 'crypto_user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'crypto_exchange',
  charset: 'utf8mb4'
};

async function resetDatabase() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(config);
    
    console.log('✅ Connected to database successfully');
    
    // 1. 모든 테이블 삭제 (외래키 제약조건 무시)
    console.log('🗑️ Dropping all tables...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'crypto_exchange'
    `);
    
    for (const table of tables) {
      console.log(`  Dropping table: ${table.TABLE_NAME}`);
      await connection.execute(`DROP TABLE IF EXISTS \`${table.TABLE_NAME}\``);
    }
    
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ All tables dropped');
    
    // 2. TypeORM 메타데이터 테이블도 삭제
    await connection.execute('DROP TABLE IF EXISTS typeorm_metadata');
    
    console.log('🎉 Database reset completed successfully!');
    console.log('💡 Now restart the application to let TypeORM recreate the tables.');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

resetDatabase();