import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from '../application/services/auth.service';
import { User } from '../domain/entities/user.entity';
import { APP_CONSTANTS } from '@crypto-exchange/shared';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      secret: APP_CONSTANTS.JWT_SECRET,
      signOptions: { expiresIn: APP_CONSTANTS.JWT_EXPIRES_IN },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
