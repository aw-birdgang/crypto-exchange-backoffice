import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin@crypto-exchange.com',
    description: '사용자 이메일 주소',
    format: 'email'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'admin123!',
    description: '사용자 비밀번호 (최소 6자 이상)',
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: '사용자 이메일 주소 (고유해야 함)',
    format: 'email'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: '사용자 비밀번호 (최소 6자 이상)',
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'John',
    description: '사용자 이름',
    minLength: 1
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: '사용자 성',
    minLength: 1
  })
  @IsString()
  lastName: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: '리프레시 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @IsString()
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT 액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT 리프레시 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  refreshToken: string;

  @ApiProperty({
    description: '사용자 정보',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user'
    }
  })
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export class RefreshResponseDto {
  @ApiProperty({
    description: '새로운 JWT 액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken: string;

  @ApiProperty({
    description: '새로운 JWT 리프레시 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  refreshToken: string;
}
