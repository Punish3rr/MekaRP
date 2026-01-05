// This file should be generated using: supabase gen types typescript --project-id <project-id> > types/database.types.ts
// For development, we use a permissive type structure

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      workshops: {
        Row: {
          id: string;
          name: string;
          location: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      customers: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          technical_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string;
          project_name: string | null;
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number | null;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      work_items: {
        Row: {
          id: string;
          order_id: string;
          workshop_id: string;
          assigned_personnel_id: string | null;
          title: string | null;
          description: string | null;
          current_status: string;
          progress_step: number;
          next_process_step: string | null;
          current_step_id: string | null;
          archived_at: string | null;
          created_by: string;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      work_item_process_steps: {
        Row: {
          id: string;
          work_item_id: string;
          step_order: number;
          name: string;
          status: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      work_item_updates: {
        Row: {
          id: string;
          work_item_id: string;
          requested_by_user_id: string;
          requested_status: string | null;
          requested_progress_step: number | null;
          requested_note: string | null;
          state: string;
          reviewer_user_id: string | null;
          reviewed_at: string | null;
          review_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      attachments: {
        Row: {
          id: string;
          entity_type: string;
          entity_id: string;
          uploader_user_id: string;
          storage_path: string;
          original_filename: string;
          mime_type: string;
          size_bytes: number;
          file_hash: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          delete_reason: string | null;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      audit_log: {
        Row: {
          id: string;
          actor_user_id: string;
          action: string;
          entity_type: string;
          entity_id: string;
          before: unknown;
          after: unknown;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      work_item_status_history: {
        Row: {
          id: string;
          work_item_id: string;
          actor_user_id: string;
          from_status: string | null;
          to_status: string;
          from_progress_step: number | null;
          to_progress_step: number | null;
          note: string | null;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      notifications: {
        Row: {
          id: string;
          recipient_user_id: string;
          type: string;
          entity_type: string;
          entity_id: string;
          payload: unknown;
          is_read: boolean;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      record_locks: {
        Row: {
          id: string;
          entity_type: string;
          entity_id: string;
          locked_by_user_id: string;
          locked_at: string;
          expires_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      app_settings: {
        Row: {
          id: string;
          key: string;
          value: unknown;
          description: string | null;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
};
