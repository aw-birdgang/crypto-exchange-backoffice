const axios = require('axios');

async function initializePermissions() {
  try {
    console.log('🔄 Initializing permissions...');
    
    // 로그인하여 토큰 획득
    const loginResponse = await axios.post('http://localhost:3000/auth/login', {
      email: 'superadmin@crypto-exchange.com',
      password: 'superadmin123!'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');
    
    // 권한 초기화
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
    
    // 내 권한 확인
    const permissionsResponse = await axios.get(
      'http://localhost:3000/permissions/my-permissions',
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('📊 Current permissions:', JSON.stringify(permissionsResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

initializePermissions();
