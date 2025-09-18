const axios = require('axios');

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // 1. 로그인하여 토큰 획득
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('http://localhost:3000/auth/login', {
      email: 'superadmin@crypto-exchange.com',
      password: 'superadmin123!'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');
    
    // 2. 권한 초기화
    console.log('🔐 Initializing permissions...');
    const initResponse = await axios.post(
      'http://localhost:3000/permissions/initialize',
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ Permissions initialized:', initResponse.data);
    
    // 3. 역할 목록 확인
    console.log('📋 Getting roles...');
    const rolesResponse = await axios.get(
      'http://localhost:3000/permissions/roles',
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ Roles retrieved:', JSON.stringify(rolesResponse.data, null, 2));
    
    // 4. 내 권한 확인
    console.log('🔍 Getting my permissions...');
    const permissionsResponse = await axios.get(
      'http://localhost:3000/permissions/my-permissions',
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('✅ My permissions:', JSON.stringify(permissionsResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status === 500) {
      console.error('❌ 500 Internal Server Error - Check server logs');
    }
  }
}

initializeDatabase();
