# Role과 Role-Permissions의 관계 분석

## 1. 데이터베이스 구조

### Roles 테이블
```sql
CREATE TABLE roles (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description VARCHAR(255),
  isSystem TINYINT DEFAULT 0,
  createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);
```

### Role_Permissions 테이블
```sql
CREATE TABLE role_permissions (
  id VARCHAR(36) PRIMARY KEY,
  roleId VARCHAR(36),
  resource ENUM('dashboard','settings','permissions','users','roles') NOT NULL,
  permissions JSON NOT NULL,
  createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  FOREIGN KEY (roleId) REFERENCES roles(id)
);
```

## 2. 엔티티 관계

### Role 엔티티
```typescript
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isSystem: boolean;

  // RolePermission과의 1:N 관계
  @OneToMany(() => RolePermission, rolePermission => rolePermission.role)
  permissions: RolePermission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### RolePermission 엔티티
```typescript
@Entity('role_permissions')
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  roleId: string;

  // Role과의 N:1 관계
  @ManyToOne(() => Role, role => role.permissions)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @Column({ type: 'enum', enum: Resource })
  resource: Resource;

  @Column('json')
  permissions: Permission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## 3. 관계 설명

### 3.1 관계 유형
- **Role** ↔ **RolePermission**: **1:N (One-to-Many)**
- 하나의 Role은 여러 개의 RolePermission을 가질 수 있음
- 하나의 RolePermission은 하나의 Role에만 속함

### 3.2 관계 매핑
- `Role.permissions`: `@OneToMany(() => RolePermission, rolePermission => rolePermission.role)`
- `RolePermission.role`: `@ManyToOne(() => Role, role => role.permissions)`
- `@JoinColumn({ name: 'roleId' })`: 외래키 컬럼 지정

### 3.3 데이터 흐름
```
AdminUser (adminRole: 'SUPER_ADMIN')
    ↓
Role (name: 'super_admin')
    ↓
RolePermission[] (resource + permissions)
```

## 4. 현재 데이터 상태

### 4.1 Roles 데이터
| id | name | description | isSystem | permission_count |
|----|------|-------------|----------|------------------|
| a3784229-efa1-4884-9d0f-3d9976874a69 | super_admin | 최고 관리자 - 모든 권한을 가진 시스템 관리자 | 1 | 4 |
| 6c2a23a7-46d3-46dd-8dc9-5ecbc86a480c | admin | 관리자 - 일반 관리자 권한 | 1 | 4 |
| 9e261a06-66f9-46a3-8a63-2e84bf123a49 | auditor | 감사자 - 감사 및 모니터링 권한 | 0 | 0 |
| 781391b5-1ad5-4d5f-aa4e-8223613cc1ee | moderator | 모더레이터 - 콘텐츠 관리 권한 | 0 | 0 |
| d7fbbb25-4c86-436d-be58-371de93d4e7b | support | 지원팀 - 고객 지원 권한 | 0 | 0 |
| 92226ef4-b75a-4553-9b3e-9bec95084779 | 개발1팀 | 개발 1팀 역할. | 0 | 0 |

### 4.2 Role_Permissions 데이터
| roleId | resource | permissions |
|--------|----------|-------------|
| a3784229-efa1-4884-9d0f-3d9976874a69 | dashboard | ["manage"] |
| a3784229-efa1-4884-9d0f-3d9976874a69 | settings | ["manage"] |
| a3784229-efa1-4884-9d0f-3d9976874a69 | permissions | ["manage"] |
| a3784229-efa1-4884-9d0f-3d9976874a69 | roles | ["manage"] |
| 6c2a23a7-46d3-46dd-8dc9-5ecbc86a480c | dashboard | ["read"] |
| 6c2a23a7-46d3-46dd-8dc9-5ecbc86a480c | settings | ["read"] |
| 6c2a23a7-46d3-46dd-8dc9-5ecbc86a480c | permissions | ["read"] |
| 6c2a23a7-46d3-46dd-8dc9-5ecbc86a480c | roles | ["read"] |

## 5. 문제점 및 해결방안

### 5.1 현재 문제
- `superadmin@crypto-exchange.com` 사용자가 `SUPER_ADMIN` 역할을 가지고 있지만 권한이 빈 배열로 반환됨
- TypeORM의 복잡한 JOIN 쿼리로 인한 성능 문제

### 5.2 해결방안
1. **직접 쿼리 사용**: `createQueryBuilder`와 `getRawMany()` 사용
2. **관계 로딩 최적화**: 필요한 필드만 선택적으로 로드
3. **캐시 제거**: 실시간 데이터 조회를 위해 캐시 비활성화

### 5.3 권장 개선사항
1. **인덱스 추가**: `role_permissions.roleId`에 인덱스 추가
2. **쿼리 최적화**: 필요한 데이터만 조회하는 쿼리 작성
3. **에러 처리**: 권한 조회 실패 시 적절한 에러 메시지 제공

## 6. 사용 예시

### 6.1 권한 조회
```typescript
// 사용자 권한 조회
const userPermissions = await permissionService.getUserPermissions(userId);
// 결과: { userId, role: 'super_admin', permissions: [...] }
```

### 6.2 권한 확인
```typescript
// 특정 권한 확인
const hasPermission = await permissionService.hasPermission(
  userId, 
  Resource.DASHBOARD, 
  Permission.MANAGE
);
```

### 6.3 역할별 권한 조회
```typescript
// 역할별 권한 조회
const rolePermissions = await permissionService.getRolePermissions(UserRole.SUPER_ADMIN);
```
