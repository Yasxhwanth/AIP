-- Create a restricted application user to ensure RLS is enforced
-- RLS does not apply to superusers, so we need a normal user.

-- 1. Create the user if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'aip_app') THEN
        CREATE ROLE aip_app WITH LOGIN PASSWORD 'aip_password';
    END IF;
END $$;

-- 2. Grant permissions
GRANT CONNECT ON DATABASE aip_db TO aip_app;
GRANT USAGE ON SCHEMA public TO aip_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO aip_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO aip_app;

-- Ensure future tables are also accessible
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO aip_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO aip_app;
