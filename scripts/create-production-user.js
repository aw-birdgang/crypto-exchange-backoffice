const axios = require('axios');

async function createProductionUser() {
  try {
    console.log('🔄 Creating production user...');
    
    // 1. 사용자 등록
    console.log('📝 Registering new user...');
    const registerResponse = await axios.post('http://localhost:3001/auth/register', {
      email: 'admin@example.com',
      password: 'admin123!',
      firstName: 'Admin',
      lastName: 'User'
    });
    console.log('✅ User registered successfully');
    console.log('📊 User info:', registerResponse.data.user);
    
    const token = registerResponse.data.accessToken;
    
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
    
    // 3. 내 권한 확인
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
      console.error('❌ Error getting permissions:', error.response?.data || error.message);
    }
    
    // 4. 로그인 테스트
    console.log('🔐 Testing login...');
    try {
      const loginResponse = await axios.post('http://localhost:3001/auth/login', {
        email: 'admin@example.com',
        password: 'admin123!'
      });
      console.log('✅ Login successful');
      console.log('📊 Login response:', loginResponse.data.user);
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createProductionUser();
