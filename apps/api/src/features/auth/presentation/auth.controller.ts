import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { AuthService } from '../application/services/auth.service';
import { LoginDto, RegisterDto, AuthResponseDto, RefreshTokenDto, RefreshResponseDto } from '../application/dto/auth.dto';
import { Public } from '../application/decorators/public.decorator';
import { ApiBodyHelpers } from './constants/api-body.constants';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionService } from '../application/services/permission.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly permissionService: PermissionService
  ) {}

  @Post('register')
  @Public()
  @ApiOperation({
    summary: '회원가입',
    description: '새로운 사용자 계정을 생성합니다. 이메일은 고유해야 합니다.'
  })
  @ApiBodyHelpers.register()
  @ApiResponse({
    status: 201,
    description: '회원가입 성공 (관리자 승인 대기)',
    example: {
      message: '회원가입이 완료되었습니다. 관리자 승인을 기다려주세요.',
      userId: '123e4567-e89b-12d3-a456-426614174000'
    }
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청 데이터',
    example: {
      statusCode: 400,
      message: ['email must be an email', 'password must be longer than or equal to 6 characters'],
      error: 'Bad Request'
    }
  })
  @ApiConflictResponse({
    description: '이미 존재하는 이메일',
    example: {
      statusCode: 409,
      message: 'Email already exists',
      error: 'Conflict'
    }
  })
  @ApiInternalServerErrorResponse({
    description: '서버 내부 오류',
    example: {
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error'
    }
  })
  async register(@Body() registerDto: RegisterDto): Promise<{ message: string; userId: string }> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '로그인',
    description: '이메일과 비밀번호로 로그인하여 JWT 토큰을 받습니다.'
  })
  @ApiBodyHelpers.login()
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: AuthResponseDto,
    example: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'admin@crypto-exchange.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      }
    }
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청 데이터',
    example: {
      statusCode: 400,
      message: ['email must be an email', 'password must be longer than or equal to 6 characters'],
      error: 'Bad Request'
    }
  })
  @ApiUnauthorizedResponse({
    description: '인증 실패 - 잘못된 이메일 또는 비밀번호',
    example: {
      statusCode: 401,
      message: 'Invalid credentials',
      error: 'Unauthorized'
    }
  })
  @ApiInternalServerErrorResponse({
    description: '서버 내부 오류',
    example: {
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error'
    }
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '토큰 갱신',
    description: '리프레시 토큰을 사용하여 새로운 액세스 토큰과 리프레시 토큰을 발급받습니다.'
  })
  @ApiBodyHelpers.refreshToken()
  @ApiResponse({
    status: 200,
    description: '토큰 갱신 성공',
    type: RefreshResponseDto,
    example: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
  })
  @ApiUnauthorizedResponse({
    description: '유효하지 않은 리프레시 토큰',
    example: {
      statusCode: 401,
      message: 'Invalid refresh token',
      error: 'Unauthorized'
    }
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<RefreshResponseDto> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '로그아웃',
    description: '사용자를 로그아웃하고 토큰을 무효화합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '로그아웃 성공',
    example: {
      message: 'Logged out successfully'
    }
  })
  @ApiUnauthorizedResponse({
    description: '인증되지 않은 사용자',
    example: {
      statusCode: 401,
      message: 'Unauthorized',
      error: 'Unauthorized'
    }
  })
  async logout(@Request() req: any): Promise<{ message: string }> {
    // 실제 프로덕션에서는 토큰을 블랙리스트에 추가하거나 무효화하는 로직이 필요
    console.log('🚪 User logged out');
    
    // 개발 환경에서 쿠키 정리
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 Clearing cookies in development mode');
    }
    
    return { message: 'Logged out successfully' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '현재 사용자 프로필 조회',
    description: `
      현재 로그인한 사용자의 프로필 정보를 조회합니다.
      
      ## 인증 방법:
      1. **스웨거에서**: 🔒 "Authorize" 버튼 클릭 → "JWT-auth" 섹션에 토큰 입력 (Bearer 접두사 없이)
      2. **수동 헤더 추가**: "Try it out" → "Parameters" 섹션에 다음 추가:
         - Name: Authorization
         - Value: Bearer eyJhbGciOiJIUzI1NiIs...
      3. **curl로 테스트**:
         \`\`\`bash
         # 1. 먼저 로그인하여 토큰 받기
         curl -X POST "http://localhost:3001/auth/login" \\
           -H "Content-Type: application/json" \\
           -d '{
             "email": "superadmin@crypto-exchange.com",
             "password": "superadmin123!"
           }'
         
         # 2. 받은 토큰으로 프로필 조회
         curl -X GET "http://localhost:3001/auth/profile" \\
           -H "Authorization: Bearer YOUR_TOKEN_HERE"
         \`\`\`
    `
  })
  @ApiResponse({
    status: 200,
    description: '프로필 조회 성공',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'admin@crypto-exchange.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
      lastLoginAt: '2024-01-01T10:00:00.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T10:00:00.000Z'
    }
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패 - 토큰이 없거나 유효하지 않음',
    example: {
      success: false,
      message: 'No token provided',
      error: 'Unauthorized',
      timestamp: '2025-09-20T05:00:21.691Z'
    }
  })
  @ApiUnauthorizedResponse({
    description: '인증되지 않은 사용자',
    example: {
      statusCode: 401,
      message: 'Unauthorized',
      error: 'Unauthorized'
    }
  })
  async getProfile(@Request() req: any) {
    console.log('🔍 AuthController: getProfile called');
    console.log('🔍 AuthController: Request user:', req.user);
    
    const user = req.user;
    if (!user) {
      console.log('❌ AuthController: No user found in request');
      throw new Error('User not found in request');
    }
    
    const profile = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.adminRole,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    console.log('✅ AuthController: Profile data:', profile);
    return profile;
  }

  @Get('my-role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '현재 사용자 역할 조회',
    description: '현재 로그인한 사용자의 역할 상세 정보를 조회합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '역할 조회 성공',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'admin',
      description: '관리자 역할',
      isSystem: true,
      permissions: [
        {
          id: 'perm-1',
          role: 'admin',
          resource: 'DASHBOARD',
          permissions: ['READ'],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
  })
  @ApiUnauthorizedResponse({
    description: '인증되지 않은 사용자',
    example: {
      statusCode: 401,
      message: 'Unauthorized',
      error: 'Unauthorized'
    }
  })
  async getMyRole(@Request() req: any) {
    console.log('🔍 AuthController: getMyRole called');
    console.log('🔍 AuthController: Request user:', req.user);
    
    const user = req.user;
    if (!user) {
      console.log('❌ AuthController: No user found in request');
      throw new Error('User not found in request');
    }
    
    // AdminRole을 AdminUserRole로 매핑
    let userRole: string;
    switch (user.adminRole) {
      case 'SUPER_ADMIN':
        userRole = 'super_admin';
        break;
      case 'ADMIN':
        userRole = 'admin';
        break;
      case 'MODERATOR':
        userRole = 'moderator';
        break;
      case 'SUPPORT':
        userRole = 'support';
        break;
      case 'AUDITOR':
        userRole = 'auditor';
        break;
      default:
        userRole = 'support'; // 기본값
    }
    
    console.log('🔍 AuthController: Mapped userRole:', userRole);
    
    // 역할 이름으로 역할 조회
    const role = await this.permissionService.getRoleByName(userRole);
    console.log('🔍 AuthController: Found role:', role);
    
    return role;
  }

  @Get('my-role-id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '현재 사용자 역할 ID 조회',
    description: '현재 로그인한 사용자의 역할 ID를 조회합니다. 이 ID를 사용하여 /permissions/roles/{id} API를 호출할 수 있습니다.'
  })
  @ApiResponse({
    status: 200,
    description: '역할 ID 조회 성공',
    example: {
      roleId: '123e4567-e89b-12d3-a456-426614174000',
      roleName: 'admin',
      adminRole: 'ADMIN'
    }
  })
  @ApiUnauthorizedResponse({
    description: '인증되지 않은 사용자',
    example: {
      statusCode: 401,
      message: 'Unauthorized',
      error: 'Unauthorized'
    }
  })
  async getMyRoleId(@Request() req: any) {
    console.log('🔍 AuthController: getMyRoleId called');
    console.log('🔍 AuthController: Request user:', req.user);
    
    const user = req.user;
    if (!user) {
      console.log('❌ AuthController: No user found in request');
      throw new Error('User not found in request');
    }
    
    // AdminRole을 AdminUserRole로 매핑
    let userRole: string;
    switch (user.adminRole) {
      case 'SUPER_ADMIN':
        userRole = 'super_admin';
        break;
      case 'ADMIN':
        userRole = 'admin';
        break;
      case 'MODERATOR':
        userRole = 'moderator';
        break;
      case 'SUPPORT':
        userRole = 'support';
        break;
      case 'AUDITOR':
        userRole = 'auditor';
        break;
      default:
        userRole = 'support'; // 기본값
    }
    
    console.log('🔍 AuthController: Mapped userRole:', userRole);
    
    // 역할 이름으로 역할 조회하여 ID 반환
    const role = await this.permissionService.getRoleByName(userRole);
    console.log('🔍 AuthController: Found role:', role);
    
    const result = {
      roleId: role?.id || null,
      roleName: userRole,
      adminRole: user.adminRole
    };
    
    console.log('✅ AuthController: Role ID result:', result);
    return result;
  }

  @Get('test-auth')
  @Public()
  @ApiOperation({
    summary: '인증 테스트 (공개)',
    description: `
      인증 없이 호출할 수 있는 테스트 엔드포인트입니다. 헤더 정보를 확인할 수 있습니다.
      
      ## 테스트 방법:
      1. **브라우저에서 직접 접속**: http://localhost:3001/auth/test-auth
      2. **curl로 테스트**:
         \`\`\`bash
         # 헤더 없이 테스트
         curl -X GET "http://localhost:3001/auth/test-auth"
         
         # 헤더와 함께 테스트
         curl -X GET "http://localhost:3001/auth/test-auth" \\
           -H "Authorization: Bearer YOUR_TOKEN_HERE"
         \`\`\`
    `
  })
  @ApiResponse({
    status: 200,
    description: '테스트 성공',
    example: {
      message: 'Test endpoint working',
      headers: {
        authorization: 'Bearer token...',
        'user-agent': 'Mozilla/5.0...'
      }
    }
  })
  async testAuth(@Request() req: any) {
    console.log('🔍 AuthController: testAuth called');
    console.log('🔍 AuthController: All headers:', req.headers);
    
    return {
      message: 'Test endpoint working',
      headers: {
        authorization: req.headers.authorization || req.headers.Authorization || 'No authorization header',
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
        'referer': req.headers['referer'],
        allHeaders: Object.keys(req.headers)
      },
      timestamp: new Date().toISOString()
    };
  }
}
