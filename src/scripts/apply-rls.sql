DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'projectId' AND table_schema = 'public'
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', rec.table_name);
        EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', rec.table_name);
        
        -- Policy for tenant isolation
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', rec.table_name);
        EXECUTE format('CREATE POLICY tenant_isolation ON %I USING ("projectId" = current_setting(''aip.tenant_id'', true))', rec.table_name);
        
        RAISE NOTICE 'RLS Enabled and Policy applied to table: %', rec.table_name;
    END LOOP;
END $$;
