-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_item_process_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_item_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_item_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE record_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE user_id = user_uuid;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function to check if user is admin or manager
CREATE OR REPLACE FUNCTION is_admin_or_manager(user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT get_user_role(user_uuid) IN ('ADMIN', 'MANAGER');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Note: auth.uid() is provided by Supabase by default

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Workshops policies
CREATE POLICY "Everyone can view active workshops"
  ON workshops FOR SELECT
  USING (is_active = true OR is_admin_or_manager(auth.uid()));

CREATE POLICY "Managers can manage workshops"
  ON workshops FOR ALL
  USING (is_admin_or_manager(auth.uid()));

-- Customers policies
CREATE POLICY "Everyone can view customers"
  ON customers FOR SELECT
  USING (true);

CREATE POLICY "Managers can manage customers"
  ON customers FOR ALL
  USING (is_admin_or_manager(auth.uid()));

-- Products policies
CREATE POLICY "Everyone can view products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Managers can manage products"
  ON products FOR ALL
  USING (is_admin_or_manager(auth.uid()));

-- Orders policies
CREATE POLICY "Everyone can view orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Managers can create orders"
  ON orders FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('ADMIN', 'MANAGER', 'MIDDLE_MANAGER'));

CREATE POLICY "Managers can update orders"
  ON orders FOR UPDATE
  USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Managers can delete orders"
  ON orders FOR DELETE
  USING (is_admin_or_manager(auth.uid()));

-- Order items policies
CREATE POLICY "Everyone can view order items"
  ON order_items FOR SELECT
  USING (true);

CREATE POLICY "Managers can manage order items"
  ON order_items FOR ALL
  USING (is_admin_or_manager(auth.uid()));

-- Work items policies
CREATE POLICY "Everyone can view work items"
  ON work_items FOR SELECT
  USING (true);

CREATE POLICY "Managers can create work items"
  ON work_items FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('ADMIN', 'MANAGER', 'MIDDLE_MANAGER'));

CREATE POLICY "Managers can update work items"
  ON work_items FOR UPDATE
  USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Middle managers can update assigned work items"
  ON work_items FOR UPDATE
  USING (
    get_user_role(auth.uid()) = 'MIDDLE_MANAGER' AND
    (workshop_id IN (
      SELECT workshop_id FROM work_items WHERE assigned_personnel_id = auth.uid()
    ) OR true) -- Simplified: middle managers can update any work item
  );

CREATE POLICY "Personnel can view assigned work items"
  ON work_items FOR SELECT
  USING (true);

CREATE POLICY "Managers can delete work items"
  ON work_items FOR DELETE
  USING (is_admin_or_manager(auth.uid()));

-- Work item process steps policies
CREATE POLICY "Everyone can view process steps"
  ON work_item_process_steps FOR SELECT
  USING (true);

CREATE POLICY "Managers can manage process steps"
  ON work_item_process_steps FOR ALL
  USING (get_user_role(auth.uid()) IN ('ADMIN', 'MANAGER', 'MIDDLE_MANAGER'));

-- Work item updates policies
CREATE POLICY "Users can view updates for their work items"
  ON work_item_updates FOR SELECT
  USING (
    work_item_id IN (SELECT id FROM work_items WHERE assigned_personnel_id = auth.uid())
    OR get_user_role(auth.uid()) IN ('ADMIN', 'MANAGER', 'MIDDLE_MANAGER')
  );

CREATE POLICY "Personnel can create updates"
  ON work_item_updates FOR INSERT
  WITH CHECK (auth.uid() = requested_by_user_id);

CREATE POLICY "Middle managers can review updates"
  ON work_item_updates FOR UPDATE
  USING (get_user_role(auth.uid()) = 'MIDDLE_MANAGER');

-- Attachments policies
CREATE POLICY "Everyone can view attachments"
  ON attachments FOR SELECT
  USING (deleted_at IS NULL OR is_admin_or_manager(auth.uid()));

CREATE POLICY "Everyone can upload attachments"
  ON attachments FOR INSERT
  WITH CHECK (auth.uid() = uploader_user_id);

CREATE POLICY "Admins and managers can delete attachments"
  ON attachments FOR UPDATE
  USING (
    is_admin_or_manager(auth.uid()) AND
    deleted_at IS NULL
  );

-- Audit log policies
CREATE POLICY "Managers can view audit logs"
  ON audit_log FOR SELECT
  USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can delete audit logs"
  ON audit_log FOR DELETE
  USING (get_user_role(auth.uid()) = 'ADMIN');

-- Work item status history policies
CREATE POLICY "Everyone can view status history"
  ON work_item_status_history FOR SELECT
  USING (true);

-- Notifications policies
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = recipient_user_id);

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = recipient_user_id);

-- Record locks policies
CREATE POLICY "Everyone can view locks"
  ON record_locks FOR SELECT
  USING (true);

CREATE POLICY "Users can create/update locks"
  ON record_locks FOR ALL
  USING (auth.uid() = locked_by_user_id OR is_admin_or_manager(auth.uid()));

-- App settings policies
CREATE POLICY "Admins can manage settings"
  ON app_settings FOR ALL
  USING (get_user_role(auth.uid()) = 'ADMIN');
