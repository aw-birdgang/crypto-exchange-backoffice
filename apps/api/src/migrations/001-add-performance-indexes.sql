-- 성능 최적화를 위한 인덱스 추가

-- admin_users 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_admin_role ON admin_users(admin_role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_users_created_at ON admin_users(created_at);

-- role_permissions 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_resource ON role_permissions(resource);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_resource ON role_permissions(role, resource);

-- roles 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_is_active ON roles(is_active);

-- 복합 인덱스 (자주 함께 사용되는 컬럼들)
CREATE INDEX IF NOT EXISTS idx_admin_users_role_active ON admin_users(admin_role, is_active);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_permissions ON role_permissions(role, permissions);

-- 부분 인덱스 (특정 조건에서만 사용)
CREATE INDEX IF NOT EXISTS idx_admin_users_active_users ON admin_users(id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_roles_active_roles ON roles(id) WHERE is_active = true;

-- 통계 정보 업데이트
ANALYZE admin_users;
ANALYZE role_permissions;
ANALYZE roles;
