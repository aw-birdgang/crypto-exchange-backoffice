-- Create database if not exists
CREATE DATABASE crypto_exchange;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schema for better organization
CREATE SCHEMA IF NOT EXISTS public;

-- Set timezone
SET timezone = 'UTC';

-- Clean up existing tables and enums that might cause conflicts
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS typeorm_metadata CASCADE;

-- Clean up existing enums
DROP TYPE IF EXISTS role_permissions_role_enum CASCADE;
DROP TYPE IF EXISTS role_permissions_role_enum_old CASCADE;
DROP TYPE IF EXISTS role_permissions_resource_enum CASCADE;
DROP TYPE IF EXISTS admin_users_adminrole_enum CASCADE;

-- Delete any existing data that might cause conflicts
DELETE FROM role_permissions WHERE role IN ('user_manager', 'order_manager', 'market_manager', 'wallet_manager', 'trader');
DELETE FROM admin_users WHERE adminRole IN ('USER_MANAGER', 'ORDER_MANAGER', 'MARKET_MANAGER', 'WALLET_MANAGER', 'TRADER');

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    "isSystem" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_isSystem ON roles("isSystem");

-- Note: User and permission data will be automatically seeded by the application
