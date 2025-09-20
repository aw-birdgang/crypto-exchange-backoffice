import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { AdminUser } from '../../domain/entities/admin-user.entity';
import { AdminUserRole } from '@crypto-exchange/shared';
import { ConflictException, UnauthorizedException } from '../../../../common/exceptions/business.exception';

describe('AuthService', () => {
  let service: AuthService;
  let adminUserRepository: Repository<AdminUser>;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockAdminUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(AdminUser),
          useValue: mockAdminUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    adminUserRepository = module.get<Repository<AdminUser>>(getRepositoryToken(AdminUser));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
    };

    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      adminRole: AdminUserRole.ADMIN,
      password: 'hashedPassword',
      username: 'test',
      permissions: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      mockConfigService.get.mockReturnValue(12);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);
      mockJwtService.sign.mockReturnValue('mockToken');
    });

    it('should register a new user successfully', async () => {
      mockAdminUserRepository.findOne.mockResolvedValue(null);
      mockAdminUserRepository.create.mockReturnValue(mockUser);
      mockAdminUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result).toEqual({
        accessToken: 'mockToken',
        refreshToken: 'mockToken',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: AdminUserRole.ADMIN,
        },
      });

      expect(mockAdminUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(mockAdminUserRepository.create).toHaveBeenCalled();
      expect(mockAdminUserRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      mockAdminUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ValidationException for invalid email', async () => {
      const invalidEmailDto = { ...registerDto, email: 'invalid-email' };

      await expect(service.register(invalidEmailDto)).rejects.toThrow();
    });

    it('should throw ValidationException for weak password', async () => {
      const weakPasswordDto = { ...registerDto, password: '123' };

      await expect(service.register(weakPasswordDto)).rejects.toThrow();
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      adminRole: AdminUserRole.ADMIN,
      password: 'hashedPassword',
      username: 'test',
      permissions: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      mockJwtService.sign.mockReturnValue('mockToken');
    });

    it('should login successfully with valid credentials', async () => {
      mockAdminUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        accessToken: 'mockToken',
        refreshToken: 'mockToken',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: AdminUserRole.ADMIN,
        },
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockAdminUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockAdminUserRepository.findOne.mockResolvedValue(inactiveUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockAdminUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    const jwtPayload = {
      sub: '1',
      email: 'test@example.com',
      role: AdminUserRole.ADMIN,
      type: 'access' as const,
    };

    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      adminRole: AdminUserRole.ADMIN,
      password: 'hashedPassword',
      username: 'test',
      permissions: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return user for valid payload', async () => {
      mockAdminUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser(jwtPayload);

      expect(result).toEqual(mockUser);
      expect(mockAdminUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockAdminUserRepository.findOne.mockResolvedValue(null);

      await expect(service.validateUser(jwtPayload)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockAdminUserRepository.findOne.mockResolvedValue(inactiveUser);

      await expect(service.validateUser(jwtPayload)).rejects.toThrow(UnauthorizedException);
    });
  });
});
