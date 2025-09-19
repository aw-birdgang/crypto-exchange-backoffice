const axios = require('axios');

async function initializePermissions() {
  try {
    console.log('🔄 Initializing permissions...');
    
    // 1. 로그인
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'superadmin@crypto-exchange.com',
      password: 'superadmin123!'
    });
    
    const token = loginResponse.data.accessToken;
    console.log('✅ Login successful');
    
    // 2. 권한 초기화
    console.log('🔐 Initializing permissions...');
    try {
      const initResponse = await axios.post(
        'http://localhost:3001/permissions/initialize',
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      console.log('✅ Permissions initialized:', initResponse.data);
    } catch (error) {
      console.error('❌ Error initializing permissions:', error.response?.data || error.message);
    }
    
    // 3. 모든 역할 권한 조회
    console.log('📋 Getting all role permissions...');
    try {
      const rolePermissionsResponse = await axios.get(
        'http://localhost:3001/permissions/role-permissions',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      console.log('✅ Role permissions:', JSON.stringify(rolePermissionsResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Error getting role permissions:', error.response?.data || error.message);
    }
    
    // 4. 내 권한 확인
    console.log('🔍 Getting my permissions...');
    try {
      const permissionsResponse = await axios.get(
        'http://localhost:3001/permissions/my-permissions',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      console.log('✅ My permissions:', JSON.stringify(permissionsResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Error getting my permissions:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

initializePermissions();
