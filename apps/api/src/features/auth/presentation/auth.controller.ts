import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import { AuthService } from '../application/services/auth.service';
import { LoginDto, RegisterDto, AuthResponseDto, RefreshTokenDto, RefreshResponseDto } from '../application/dto/auth.dto';
import { Public } from '../application/decorators/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @ApiOperation({
    summary: '회원가입',
    description: '새로운 사용자 계정을 생성합니다. 이메일은 고유해야 합니다.'
  })
  @ApiBody({
    type: RegisterDto,
    description: '회원가입 정보',
    examples: {
      example1: {
        summary: '일반 사용자 회원가입',
        value: {
          email: 'user@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    type: AuthResponseDto,
    example: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user'
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
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '로그인',
    description: '이메일과 비밀번호로 로그인하여 JWT 토큰을 받습니다.'
  })
  @ApiBody({
    type: LoginDto,
    description: '로그인 정보',
    examples: {
      admin: {
        summary: '관리자 로그인',
        value: {
          email: 'superadmin@crypto-exchange.com',
          password: 'superadmin123!'
        }
      },
      user: {
        summary: '일반 사용자 로그인',
        value: {
          email: 'user@example.com',
          password: 'password123'
        }
      }
    }
  })
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
  @ApiBody({
    type: RefreshTokenDto,
    description: '리프레시 토큰'
  })
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
  async logout(): Promise<{ message: string }> {
    // 실제 프로덕션에서는 토큰을 블랙리스트에 추가하거나 무효화하는 로직이 필요
    console.log('🚪 User logged out');
    return { message: 'Logged out successfully' };
  }
}
