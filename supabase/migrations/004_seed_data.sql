-- Insert default app settings
INSERT INTO app_settings (key, value, description) VALUES
  ('on_hold_sla_days', '3'::jsonb, 'Number of days before ON_HOLD items trigger SLA notification')
ON CONFLICT (key) DO NOTHING;

-- Note: Users and profiles should be created through Supabase Auth UI or API
-- This migration assumes initial admin user will be created manually
-- Example SQL to create admin (run after user is created in auth.users):
-- INSERT INTO profiles (user_id, role, full_name)
-- VALUES ('<user-uuid-from-auth>', 'ADMIN', 'Admin User')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'ADMIN';
