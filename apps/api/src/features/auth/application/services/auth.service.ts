import {Injectable} from '@nestjs/common';
import {ConflictException, UnauthorizedException} from '../../../../common/exceptions/business.exception';
import {ExceptionFactory} from '../../../../common/exceptions/enhanced-business.exception';
import {JwtService} from '@nestjs/jwt';
import {InjectRepository} from '@nestjs/typeorm';
import {ConfigService} from '@nestjs/config';
import {Repository} from 'typeorm';
import * as bcrypt from 'bcrypt';
import {AdminUser} from '../../domain/entities/admin-user.entity';
import {AdminUserRole} from '@crypto-exchange/shared';
import {AuthResponseDto, LoginDto, RefreshResponseDto, RefreshTokenDto, RegisterDto} from '../dto/auth.dto';
import {JwtPayload, RefreshTokenPayload} from '@crypto-exchange/shared';
import {ValidationUtil} from '../../../../common/utils/validation.util';
import {PermissionService} from './permission.service';
import {IRoleMapper, IAuthMapper, MAPPER_TOKENS} from '../providers/mapper.providers';
import {Inject} from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private permissionService: PermissionService,
    @Inject(MAPPER_TOKENS.ROLE_MAPPER)
    private roleMapper: IRoleMapper,
    @Inject(MAPPER_TOKENS.AUTH_MAPPER)
    private authMapper: IAuthMapper,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string; userId: string }> {
    // 입력 검증
    ValidationUtil.validateEmail(registerDto.email);
    ValidationUtil.validatePassword(registerDto.password);

    // 중복 사용자 확인
    await this.checkUserExists(registerDto.email);

    // 사용자 생성 (PENDING 상태)
    const user = await this.createUser(registerDto);
    const savedUser = await this.adminUserRepository.save(user);

    return {
      message: '회원가입이 완료되었습니다. 관리자 승인을 기다려주세요.',
      userId: savedUser.id,
    };
  }

  private async checkUserExists(email: string): Promise<void> {
    const existingUser = await this.adminUserRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw ExceptionFactory.emailDuplicate({ email });
    }
  }

  private async createUser(registerDto: RegisterDto): Promise<AdminUser> {
    const bcryptRounds = this.configService.get<number>('app.security.bcryptRounds') || 12;
    const hashedPassword = await bcrypt.hash(registerDto.password, bcryptRounds);

    return this.adminUserRepository.create({
      ...registerDto,
      password: hashedPassword,
      username: registerDto.email.split('@')[0],
      adminRole: AdminUserRole.SUPPORT,
      permissions: [],
      status: 'PENDING',
      isActive: false,
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
    
    console.log('🔍 AuthService: Login successful, generated tokens:', {
      accessToken: tokens.accessToken ? `${tokens.accessToken.substring(0, 20)}...` : 'No access token',
      refreshToken: tokens.refreshToken ? `${tokens.refreshToken.substring(0, 20)}...` : 'No refresh token',
      user: {
        id: user.id,
        email: user.email,
        adminRole: user.adminRole
      }
    });

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
      throw ExceptionFactory.invalidCredentials({ email });
    }

    if (user.status !== 'APPROVED') {
      throw ExceptionFactory.accountPending({ userId: user.id, status: user.status });
    }

    if (!user.isActive) {
      throw ExceptionFactory.accountDeactivated({ userId: user.id });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw ExceptionFactory.invalidCredentials({ email });
    }

    return user;
  }

  async validateUser(payload: JwtPayload): Promise<AdminUser> {
    const user = await this.adminUserRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw ExceptionFactory.userNotFound({ userId: payload.sub });
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
        throw ExceptionFactory.tokenInvalid({ tokenType: payload.type });
      }

      const user = await this.adminUserRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw ExceptionFactory.userNotFound({ userId: payload.sub });
      }

      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw ExceptionFactory.tokenInvalid({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
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

  /**
   * 사용자의 역할 ID 조회
   */
  async getUserRoleId(user: AdminUser): Promise<{
    roleId: string | null;
    roleName: string;
    adminRole: AdminUserRole;
  }> {
    // AdminRole을 역할 이름으로 변환
    const roleName = this.roleMapper.mapAdminRoleToRoleName(user.adminRole);
    
    // 역할 이름으로 역할 조회하여 ID 반환
    const role = await this.permissionService.getRoleByName(roleName);
    
    return {
      roleId: role?.id || null,
      roleName,
      adminRole: user.adminRole,
    };
  }

  /**
   * 사용자의 역할 상세 정보 조회
   */
  async getMyRole(user: AdminUser) {
    // AdminRole을 역할 이름으로 변환
    const roleName = this.roleMapper.mapAdminRoleToRoleName(user.adminRole);
    
    // 역할 이름으로 역할 조회
    const role = await this.permissionService.getRoleByName(roleName);
    
    return role;
  }

  /**
   * 사용자 프로필 조회 (mapper 사용)
   */
  async getUserProfile(userId: string) {
    const user = await this.adminUserRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.authMapper.toUserProfile(user);
  }
}
