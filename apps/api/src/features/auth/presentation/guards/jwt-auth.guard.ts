import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../application/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    console.log('🔍 JwtAuthGuard: Checking if endpoint is public:', isPublic);
    
    if (isPublic) {
      console.log('✅ JwtAuthGuard: Public endpoint, skipping authentication');
      return true;
    }

    console.log('🔍 JwtAuthGuard: Protected endpoint, proceeding with JWT validation');
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      console.error('❌ JwtAuthGuard: Authentication failed:', { err, info });
      throw err || new Error('Authentication failed');
    }

    console.log('✅ JwtAuthGuard: User authenticated successfully:', {
      id: user.id,
      email: user.email,
      adminRole: user.adminRole
    });

    return user;
  }
}
