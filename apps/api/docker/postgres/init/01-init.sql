-- Create database if not exists
CREATE DATABASE crypto_exchange;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schema for better organization
CREATE SCHEMA IF NOT EXISTS public;

-- Set timezone
SET timezone = 'UTC';

-- Note: User table and admin user will be created by TypeORM synchronization
-- The application will handle the initial admin user creation through the API
