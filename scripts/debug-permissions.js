const axios = require('axios');

async function debugPermissions() {
  try {
    console.log('🔄 Debugging permissions...');
    
    // 1. 로그인
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'superadmin@crypto-exchange.com',
      password: 'superadmin123!'
    });
    
    const token = loginResponse.data.accessToken;
    const userId = loginResponse.data.user.id;
    console.log('✅ Login successful');
    console.log('📊 User ID:', userId);
    console.log('📊 User role:', loginResponse.data.user.role);
    
    // 2. 내 권한 확인
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
      
      // 권한 데이터 분석
      const permissions = permissionsResponse.data;
      console.log('📊 Analysis:');
      console.log('- User ID in response:', permissions.userId);
      console.log('- Expected User ID:', userId);
      console.log('- Match:', permissions.userId === userId);
      console.log('- Role:', permissions.role);
      console.log('- Permissions count:', permissions.permissions?.length || 0);
      
    } catch (error) {
      console.error('❌ Error getting my permissions:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugPermissions();
