-- Audit log trigger function
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  actor_id UUID;
BEGIN
  -- Get current user ID from JWT if available, otherwise use system
  actor_id := COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb->>'sub')::uuid,
    (current_setting('app.current_user_id', true)::uuid)
  );

  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (actor_user_id, action, entity_type, entity_id, after)
    VALUES (
      COALESCE(actor_id, NEW.created_by),
      'INSERT',
      CASE 
        WHEN TG_TABLE_NAME = 'orders' THEN 'order'::entity_type
        WHEN TG_TABLE_NAME = 'order_items' THEN 'order'::entity_type
        WHEN TG_TABLE_NAME = 'work_items' THEN 'work_item'::entity_type
        WHEN TG_TABLE_NAME = 'work_item_process_steps' THEN 'work_item'::entity_type
        WHEN TG_TABLE_NAME = 'attachments' THEN 'attachment'::entity_type
        ELSE 'order'::entity_type
      END,
      NEW.id,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (actor_user_id, action, entity_type, entity_id, before, after)
    VALUES (
      COALESCE(actor_id, NEW.updated_by, OLD.updated_by),
      'UPDATE',
      CASE 
        WHEN TG_TABLE_NAME = 'orders' THEN 'order'::entity_type
        WHEN TG_TABLE_NAME = 'order_items' THEN 'order'::entity_type
        WHEN TG_TABLE_NAME = 'work_items' THEN 'work_item'::entity_type
        WHEN TG_TABLE_NAME = 'work_item_process_steps' THEN 'work_item'::entity_type
        WHEN TG_TABLE_NAME = 'attachments' THEN 'attachment'::entity_type
        ELSE 'order'::entity_type
      END,
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (actor_user_id, action, entity_type, entity_id, before)
    VALUES (
      COALESCE(actor_id, OLD.updated_by),
      'DELETE',
      CASE 
        WHEN TG_TABLE_NAME = 'orders' THEN 'order'::entity_type
        WHEN TG_TABLE_NAME = 'order_items' THEN 'order'::entity_type
        WHEN TG_TABLE_NAME = 'work_items' THEN 'work_item'::entity_type
        WHEN TG_TABLE_NAME = 'work_item_process_steps' THEN 'work_item'::entity_type
        WHEN TG_TABLE_NAME = 'attachments' THEN 'attachment'::entity_type
        ELSE 'order'::entity_type
      END,
      OLD.id,
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers
CREATE TRIGGER audit_orders AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_order_items AFTER INSERT OR UPDATE OR DELETE ON order_items
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_work_items AFTER INSERT OR UPDATE OR DELETE ON work_items
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_work_item_process_steps AFTER INSERT OR UPDATE OR DELETE ON work_item_process_steps
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_attachments AFTER INSERT OR UPDATE OR DELETE ON attachments
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();
