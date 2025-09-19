const axios = require('axios');

async function resetDatabase() {
  try {
    console.log('🔄 Resetting database...');
    
    // 1. Docker 컨테이너 재시작 (PostgreSQL)
    console.log('🐳 Restarting PostgreSQL container...');
    try {
      const { exec } = require('child_process');
      exec('docker-compose down && docker-compose up -d', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Docker restart failed:', error);
        } else {
          console.log('✅ Docker containers restarted');
        }
      });
    } catch (error) {
      console.log('⚠️ Docker restart skipped:', error.message);
    }
    
    // 2. 잠시 대기 (데이터베이스 시작 시간)
    console.log('⏳ Waiting for database to start...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 3. 새로운 사용자 생성
    console.log('👤 Creating fresh user...');
    try {
      const registerResponse = await axios.post('http://localhost:3001/auth/register', {
        email: 'admin@example.com',
        password: 'admin123!',
        firstName: 'Admin',
        lastName: 'User'
      });
      console.log('✅ Fresh user created:', registerResponse.data.user);
      
      const token = registerResponse.data.accessToken;
      
      // 4. 권한 초기화
      console.log('🔐 Initializing fresh permissions...');
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
      
      // 5. 권한 확인
      console.log('🔍 Testing fresh permissions...');
      try {
        const permissionsResponse = await axios.get(
          'http://localhost:3001/permissions/my-permissions',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        console.log('✅ Fresh permissions:', JSON.stringify(permissionsResponse.data, null, 2));
        
        // 권한 데이터 분석
        const permissions = permissionsResponse.data;
        console.log('📊 Fresh Setup Analysis:');
        console.log('- User ID in response:', permissions.userId);
        console.log('- Expected User ID:', registerResponse.data.user.id);
        console.log('- Match:', permissions.userId === registerResponse.data.user.id);
        console.log('- Role:', permissions.role);
        console.log('- Permissions count:', permissions.permissions?.length || 0);
        
      } catch (error) {
        console.error('❌ Error getting fresh permissions:', error.response?.data || error.message);
      }
      
    } catch (error) {
      console.error('❌ Error creating fresh user:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
  }
}

resetDatabase();
