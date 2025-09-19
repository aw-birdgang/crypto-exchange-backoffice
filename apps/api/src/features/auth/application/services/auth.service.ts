import { Injectable } from '@nestjs/common';
import { ConflictException, UnauthorizedException } from '../../../../common/exceptions/business.exception';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AdminUser, AdminRole } from '../../domain/entities/admin-user.entity';
import { LoginDto, RegisterDto, AuthResponseDto, RefreshTokenDto, RefreshResponseDto } from '../dto/auth.dto';
import { JwtPayload, RefreshTokenPayload } from '@crypto-exchange/shared';
import { ValidationUtil } from '../../../../common/utils/validation.util';
import { ResponseUtil } from '../../../../common/utils/response.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // 입력 검증
    ValidationUtil.validateEmail(registerDto.email);
    ValidationUtil.validatePassword(registerDto.password);

    // 중복 사용자 확인
    await this.checkUserExists(registerDto.email);

    // 사용자 생성
    const user = await this.createUser(registerDto);
    const savedUser = await this.adminUserRepository.save(user);

    // 토큰 생성
    const tokens = this.generateTokens(savedUser);

    return {
      ...tokens,
      user: this.mapUserToResponse(savedUser),
    };
  }

  private async checkUserExists(email: string): Promise<void> {
    const existingUser = await this.adminUserRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
  }

  private async createUser(registerDto: RegisterDto): Promise<AdminUser> {
    const bcryptRounds = this.configService.get<number>('app.security.bcryptRounds') || 12;
    const hashedPassword = await bcrypt.hash(registerDto.password, bcryptRounds);

    return this.adminUserRepository.create({
      ...registerDto,
      password: hashedPassword,
      username: registerDto.email.split('@')[0],
      adminRole: AdminRole.ADMIN,
      permissions: [],
    });
  }

  private generateTokens(user: AdminUser): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  private mapUserToResponse(user: AdminUser) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.adminRole,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // 입력 검증
    ValidationUtil.validateEmail(loginDto.email);

    // 사용자 인증
    const user = await this.authenticateUser(loginDto.email, loginDto.password);

    // 토큰 생성
    const tokens = this.generateTokens(user);

    return {
      ...tokens,
      user: this.mapUserToResponse(user),
    };
  }

  private async authenticateUser(email: string, password: string): Promise<AdminUser> {
    const user = await this.adminUserRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async validateUser(payload: JwtPayload): Promise<AdminUser> {
    const user = await this.adminUserRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  async findUserByEmail(email: string): Promise<AdminUser | null> {
    return this.adminUserRepository.findOne({
      where: { email },
    });
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<RefreshResponseDto> {
    try {
      const jwtSecret = this.configService.get<string>('app.jwt.secret');
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: jwtSecret,
      }) as RefreshTokenPayload;

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.adminUserRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateAccessToken(user: AdminUser): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.adminRole,
      type: 'access',
    };

    const jwtSecret = this.configService.get<string>('app.jwt.secret');
    const jwtExpiresIn = this.configService.get<string>('app.jwt.expiresIn');

    return this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: jwtExpiresIn,
    });
  }

  private generateRefreshToken(user: AdminUser): string {
    const payload: RefreshTokenPayload = {
      sub: user.id,
      email: user.email,
      type: 'refresh',
    };

    const jwtSecret = this.configService.get<string>('app.jwt.secret');
    const jwtRefreshExpiresIn = this.configService.get<string>('app.jwt.refreshExpiresIn');

    return this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: jwtRefreshExpiresIn,
    });
  }
}
