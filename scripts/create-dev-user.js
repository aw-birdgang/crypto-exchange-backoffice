const axios = require('axios');

async function createDevUser() {
  try {
    console.log('🔄 Creating development user...');
    
    // 1. 먼저 기존 사용자 로그인 시도
    let token;
    try {
      const loginResponse = await axios.post('http://localhost:3001/auth/login', {
        email: 'admin@example.com',
        password: 'admin123!'
      });
      token = loginResponse.data.access_token;
      console.log('✅ Existing user login successful');
    } catch (error) {
      console.log('⚠️ No existing user found, will create new one');
    }
    
    // 2. 사용자가 없다면 새로 생성
    if (!token) {
      try {
        const registerResponse = await axios.post('http://localhost:3001/auth/register', {
          email: 'admin@example.com',
          password: 'admin123!',
          firstName: 'Admin',
          lastName: 'User'
        });
        console.log('✅ Development user created');
        
        // 생성 후 로그인
        const loginResponse = await axios.post('http://localhost:3001/auth/login', {
          email: 'admin@example.com',
          password: 'admin123!'
        });
        token = loginResponse.data.access_token;
        console.log('✅ Login successful after registration');
      } catch (error) {
        console.error('❌ Error creating user:', error.response?.data || error.message);
        return;
      }
    }
    
    // 3. 권한 초기화
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
      console.error('❌ Error getting permissions:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createDevUser();
