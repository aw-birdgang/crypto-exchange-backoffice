#!/usr/bin/env node

/**
 * 데이터베이스 정리 스크립트
 * 중복된 빈 문자열과 잘못된 데이터를 정리
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

async function cleanDatabase() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(config);
    
    console.log('✅ Connected to database successfully');
    
    // 1. 잘못된 데이터 확인
    console.log('🔍 Checking for invalid data...');
    const [invalidRoles] = await connection.execute(`
      SELECT * FROM roles WHERE name = '' OR name IS NULL
    `);
    console.log(`Found ${invalidRoles.length} invalid roles`);
    
    // 2. 잘못된 데이터 삭제
    if (invalidRoles.length > 0) {
      console.log('🗑️ Deleting invalid roles...');
      await connection.execute(`
        DELETE FROM roles WHERE name = '' OR name IS NULL
      `);
      console.log('✅ Invalid roles deleted');
    }
    
    // 3. 중복된 빈 문자열 확인
    const [duplicateEmpty] = await connection.execute(`
      SELECT name, COUNT(*) as count 
      FROM roles 
      WHERE name = '' 
      GROUP BY name 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateEmpty.length > 0) {
      console.log('🗑️ Deleting duplicate empty strings...');
      await connection.execute(`
        DELETE FROM roles WHERE name = '' LIMIT 1
      `);
      console.log('✅ Duplicate empty strings deleted');
    }
    
    // 4. 테이블 상태 확인
    console.log('📊 Current roles table status:');
    const [roles] = await connection.execute(`
      SELECT name, COUNT(*) as count 
      FROM roles 
      GROUP BY name 
      ORDER BY name
    `);
    
    roles.forEach(role => {
      console.log(`  - ${role.name || '(empty)'}: ${role.count} records`);
    });
    
    console.log('✅ Database cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

cleanDatabase();
