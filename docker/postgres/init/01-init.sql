-- Create database if not exists
CREATE DATABASE crypto_exchange;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schema for better organization
CREATE SCHEMA IF NOT EXISTS public;

-- Set timezone
SET timezone = 'UTC';

-- Create admin user (password will be set by the application)
INSERT INTO users (id, email, password, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
VALUES (
  uuid_generate_v4(),
  'admin@crypto-exchange.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2G', -- admin123! hashed with bcrypt
  'Admin',
  'User',
  'admin',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;
