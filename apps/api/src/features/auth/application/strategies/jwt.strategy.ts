import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '@crypto-exchange/shared';
import { AuthService } from '../services/auth.service';
import { AdminUser } from '../../domain/entities/admin-user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('app.jwt.secret'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: JwtPayload): Promise<AdminUser> {
    try {
      console.log('🔍 JwtStrategy: Validating payload:', payload);
      
      const user = await this.authService.validateUser(payload);
      
      if (!user) {
        console.log('❌ JwtStrategy: User not found');
        throw new UnauthorizedException('User not found');
      }

      if (!user.isActive) {
        console.log('❌ JwtStrategy: User is inactive');
        throw new UnauthorizedException('User is inactive');
      }

      console.log('✅ JwtStrategy: User validated successfully:', {
        id: user.id,
        email: user.email,
        adminRole: user.adminRole
      });

      return user;
    } catch (error) {
      console.error('❌ JwtStrategy: Validation error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
