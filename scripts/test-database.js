const axios = require('axios');

async function testDatabase() {
  try {
    console.log('🔄 Testing database connection...');
    
    // 1. 간단한 API 호출로 서버 상태 확인
    console.log('🔍 Testing server health...');
    try {
      const response = await axios.get('http://localhost:3001/');
      console.log('✅ Server is running');
    } catch (error) {
      console.log('⚠️ Server response:', error.response?.status, error.response?.data);
    }
    
    // 2. 로그인 API 테스트 (기존 사용자가 있는지 확인)
    console.log('🔍 Testing login with default admin...');
    try {
      const loginResponse = await axios.post('http://localhost:3001/auth/login', {
        email: 'superadmin@crypto-exchange.com',
        password: 'superadmin123!'
      });
      console.log('✅ Default admin login successful');
      console.log('📊 User info:', loginResponse.data.user);
      
      const token = loginResponse.data.accessToken;
      
      // 3. 권한 확인
      console.log('🔍 Testing permissions...');
      try {
        const permissionsResponse = await axios.get(
          'http://localhost:3001/permissions/my-permissions',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        console.log('✅ Permissions retrieved successfully');
        console.log('📊 Permissions:', JSON.stringify(permissionsResponse.data, null, 2));
      } catch (error) {
        console.error('❌ Error getting permissions:', error.response?.data || error.message);
      }
      
    } catch (error) {
      console.log('⚠️ Default admin login failed:', error.response?.data || error.message);
      
      // 4. 새 사용자 등록 시도
      console.log('🔍 Trying to register new user...');
      try {
        const registerResponse = await axios.post('http://localhost:3001/auth/register', {
          email: 'test@example.com',
          password: 'test123',
          firstName: 'Test',
          lastName: 'User'
        });
        console.log('✅ User registration successful');
        console.log('📊 User info:', registerResponse.data.user);
      } catch (error) {
        console.error('❌ User registration failed:', error.response?.data || error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
}

testDatabase();
