import { Test, TestingModule } from '@nestjs/testing';
import { PermissionService } from './permission.service';
import { PermissionRepositoryInterface } from '../../domain/repositories/permission.repository.interface';
import { RoleRepositoryInterface } from '../../domain/repositories/role.repository.interface';
import { CacheService } from '../../../../common/cache/cache.service';
import { UserRole, Resource, Permission, UserPermissions, Role } from '@crypto-exchange/shared';
import { ForbiddenException } from '../../../../common/exceptions/business.exception';

describe('PermissionService', () => {
  let service: PermissionService;
  let permissionRepository: PermissionRepositoryInterface;
  let roleRepository: RoleRepositoryInterface;
  let cacheService: CacheService;

  const mockPermissionRepository = {
    getUserPermissions: jest.fn(),
    hasPermission: jest.fn(),
    hasAnyPermission: jest.fn(),
    hasMenuAccess: jest.fn(),
    createRolePermission: jest.fn(),
    updateRolePermission: jest.fn(),
    deleteRolePermission: jest.fn(),
    getRolePermissions: jest.fn(),
    getAllRolePermissions: jest.fn(),
    initializeDefaultPermissions: jest.fn(),
  };

  const mockRoleRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: 'PermissionRepositoryInterface',
          useValue: mockPermissionRepository,
        },
        {
          provide: 'RoleRepositoryInterface',
          useValue: mockRoleRepository,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
    permissionRepository = module.get<PermissionRepositoryInterface>('PermissionRepositoryInterface');
    roleRepository = module.get<RoleRepositoryInterface>('RoleRepositoryInterface');
    cacheService = module.get<CacheService>(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserPermissions', () => {
    const userId = '1';
    const mockPermissions: UserPermissions = {
      userId: '1',
      role: UserRole.ADMIN,
      permissions: [
        {
          resource: Resource.USERS,
          permissions: [Permission.READ, Permission.CREATE],
        },
      ],
    };

    it('should return permissions from cache if available', async () => {
      mockCacheService.get.mockResolvedValue(mockPermissions);

      const result = await service.getUserPermissions(userId);

      expect(result).toEqual(mockPermissions);
      expect(mockCacheService.get).toHaveBeenCalledWith('user_permissions:1');
      expect(permissionRepository.getUserPermissions).not.toHaveBeenCalled();
    });

    it('should fetch permissions from repository and cache them if not in cache', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockPermissionRepository.getUserPermissions.mockResolvedValue(mockPermissions);
      mockCacheService.set.mockResolvedValue(true);

      const result = await service.getUserPermissions(userId);

      expect(result).toEqual(mockPermissions);
      expect(mockPermissionRepository.getUserPermissions).toHaveBeenCalledWith(userId);
      expect(mockCacheService.set).toHaveBeenCalledWith(
        'user_permissions:1',
        mockPermissions,
        1800, // 30 minutes
      );
    });
  });

  describe('hasPermission', () => {
    it('should return true if user has permission', async () => {
      mockPermissionRepository.hasPermission.mockResolvedValue(true);

      const result = await service.hasPermission('1', Resource.USERS, Permission.READ);

      expect(result).toBe(true);
      expect(mockPermissionRepository.hasPermission).toHaveBeenCalledWith(
        '1',
        Resource.USERS,
        Permission.READ,
      );
    });

    it('should return false if user does not have permission', async () => {
      mockPermissionRepository.hasPermission.mockResolvedValue(false);

      const result = await service.hasPermission('1', Resource.USERS, Permission.DELETE);

      expect(result).toBe(false);
    });
  });

  describe('checkPermission', () => {
    it('should not throw if user has permission', async () => {
      mockPermissionRepository.hasPermission.mockResolvedValue(true);

      await expect(
        service.checkPermission('1', Resource.USERS, Permission.READ),
      ).resolves.not.toThrow();
    });

    it('should throw ForbiddenException if user does not have permission', async () => {
      mockPermissionRepository.hasPermission.mockResolvedValue(false);

      await expect(
        service.checkPermission('1', Resource.USERS, Permission.DELETE),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getAllRoles', () => {
    const mockRoles = [
      {
        id: '1',
        name: 'Admin',
        description: 'Administrator role',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        toRoleType: jest.fn().mockReturnValue({
          id: '1',
          name: 'Admin',
          description: 'Administrator role',
          isActive: true,
        } as unknown as Role),
      },
    ];

    it('should return roles from cache if available', async () => {
      const cachedRoles = [{ id: '1', name: 'Admin' } as Role];
      mockCacheService.get.mockResolvedValue(cachedRoles);

      const result = await service.getAllRoles();

      expect(result).toEqual(cachedRoles);
      expect(mockCacheService.get).toHaveBeenCalledWith('all_roles');
      expect(roleRepository.findAll).not.toHaveBeenCalled();
    });

    it('should fetch roles from repository and cache them if not in cache', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockRoleRepository.findAll.mockResolvedValue(mockRoles);
      mockCacheService.set.mockResolvedValue(true);

      const result = await service.getAllRoles();

      expect(result).toHaveLength(1);
      expect(mockRoleRepository.findAll).toHaveBeenCalled();
      expect(mockCacheService.set).toHaveBeenCalledWith(
        'all_roles',
        expect.any(Array),
        3600, // 1 hour
      );
    });
  });
});
