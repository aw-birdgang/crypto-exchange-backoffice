-- Comprehensive database cleanup script
-- Run this script if you encounter foreign key constraint issues

-- Connect to the database first:
-- psql -h localhost -p 5432 -U postgres -d crypto_exchange

-- Drop all foreign key constraints that depend on users table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Find and drop all foreign key constraints that reference users table
    FOR r IN (
        SELECT 
            tc.table_name, 
            tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu 
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND ccu.table_name = 'users'
    ) LOOP
        EXECUTE 'ALTER TABLE ' || r.table_name || ' DROP CONSTRAINT IF EXISTS ' || r.constraint_name || ' CASCADE';
        RAISE NOTICE 'Dropped constraint % from table %', r.constraint_name, r.table_name;
    END LOOP;
END $$;

-- Drop all tables that might have dependencies
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS user_tokens CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS user_activities CASCADE;
DROP TABLE IF EXISTS user_logs CASCADE;
DROP TABLE IF EXISTS user_wallets CASCADE;
DROP TABLE IF EXISTS user_transactions CASCADE;
DROP TABLE IF EXISTS user_orders CASCADE;

-- Drop users table
DROP TABLE IF EXISTS users CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS "UserStatus" CASCADE;
DROP TYPE IF EXISTS "UserRole" CASCADE;

-- Drop any remaining indexes
DROP INDEX IF EXISTS "users_email_key" CASCADE;
DROP INDEX IF EXISTS "users_username_key" CASCADE;

-- Clean up any remaining constraints
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'users'::regclass
    ) LOOP
        EXECUTE 'ALTER TABLE users DROP CONSTRAINT IF EXISTS ' || r.conname || ' CASCADE';
    END LOOP;
END $$;

-- Reset sequences if any
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public'
    ) LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || r.sequence_name || ' CASCADE';
    END LOOP;
END $$;

-- Clean up any remaining functions or procedures
DROP FUNCTION IF EXISTS uuid_generate_v4() CASCADE;

-- Recreate the uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Show final state
SELECT 'Database cleanup completed. You can now restart the application.' as status;
