import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtPayload } from '@crypto-exchange/shared';
import { AuthService } from '../../application/services/auth.service';
import { IS_PUBLIC_KEY } from '../../application/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    console.log('🔍 JwtAuthGuard: Checking if endpoint is public:', isPublic);
    
    if (isPublic) {
      console.log('✅ JwtAuthGuard: Public endpoint, skipping authentication');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    
    // 스웨거 요청인지 확인
    const isSwaggerRequest = request.url?.includes('/api-docs') || 
                            request.headers['user-agent']?.includes('swagger') ||
                            request.headers['referer']?.includes('/api-docs');
    
    console.log('🔍 JwtAuthGuard: Request details:', {
      method: request.method,
      url: request.url,
      isSwaggerRequest,
      headers: {
        authorization: request.headers.authorization,
        'content-type': request.headers['content-type'],
        'user-agent': request.headers['user-agent'],
        'referer': request.headers['referer']
      },
      allHeaders: Object.keys(request.headers)
    });
    
    const token = this.extractTokenFromHeader(request);
    console.log('🔍 JwtAuthGuard: Extracted token:', token ? `${token.substring(0, 20)}...` : 'No token');

    if (!token) {
      console.log('❌ JwtAuthGuard: No token provided');
      throw new UnauthorizedException('No token provided');
    }

    try {
      const jwtSecret = this.configService.get<string>('app.jwt.secret');
      console.log('🔍 JwtAuthGuard: JWT secret configured:', !!jwtSecret);
      
      const payload: JwtPayload = this.jwtService.verify(token, {
        secret: jwtSecret,
      });
      console.log('🔍 JwtAuthGuard: Token payload:', payload);
      
      const user = await this.authService.validateUser(payload);
      console.log('🔍 JwtAuthGuard: User validated:', {
        id: user.id,
        email: user.email,
        adminRole: user.adminRole
      });
      
      // 사용자 정보를 request에 추가
      request.user = user;
      console.log('✅ JwtAuthGuard: Authentication successful');
      return true;
    } catch (error) {
      console.error('❌ JwtAuthGuard: JWT validation error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // 1. Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) {
        console.log('🔍 JwtAuthGuard: Token found in Authorization header');
        return token;
      }
    }

    // 2. 쿠키에서 JWT 토큰 추출
    const jwtCookie = request.cookies?.jwt;
    if (jwtCookie) {
      console.log('🔍 JwtAuthGuard: Token found in cookie');
      return jwtCookie;
    }

    // 3. 쿠키 문자열에서 직접 추출 (fallback)
    const cookieHeader = request.headers.cookie;
    if (cookieHeader) {
      const jwtMatch = cookieHeader.match(/jwt=([^;]+)/);
      if (jwtMatch && jwtMatch[1]) {
        console.log('🔍 JwtAuthGuard: Token found in cookie string');
        return jwtMatch[1];
      }
    }

    console.log('🔍 JwtAuthGuard: No token found in any source');
    return undefined;
  }
}
