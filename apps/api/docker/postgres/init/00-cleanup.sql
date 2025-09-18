-- Database cleanup script to resolve foreign key dependency issues
-- This script should be run before the main initialization

-- Drop foreign key constraints that depend on users table
DO $$ 
BEGIN
    -- Drop notifications table if it exists and has foreign key to users
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        DROP TABLE IF EXISTS notifications CASCADE;
    END IF;
    
    -- Drop user_settings table if it exists and has foreign key to users
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_settings') THEN
        DROP TABLE IF EXISTS user_settings CASCADE;
    END IF;
    
    -- Drop any other tables that might have foreign keys to users
    -- This is a safety measure to ensure clean schema synchronization
    DROP TABLE IF EXISTS user_sessions CASCADE;
    DROP TABLE IF EXISTS user_tokens CASCADE;
    DROP TABLE IF EXISTS user_preferences CASCADE;
    DROP TABLE IF EXISTS user_activities CASCADE;
    DROP TABLE IF EXISTS user_logs CASCADE;
    
    -- Drop users table if it exists (will be recreated by TypeORM)
    DROP TABLE IF EXISTS users CASCADE;
    
    -- Drop any custom types that might conflict
    DROP TYPE IF EXISTS "UserStatus" CASCADE;
    DROP TYPE IF EXISTS "UserRole" CASCADE;
    
    -- Drop any indexes that might be left over
    DROP INDEX IF EXISTS "users_email_key" CASCADE;
    DROP INDEX IF EXISTS "users_username_key" CASCADE;
    
END $$;