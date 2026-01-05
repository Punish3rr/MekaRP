"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, requireRole, canDeleteAttachments } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { UserRole } from "@/types/auth";

export async function uploadAttachment(
  entityType: "order" | "work_item" | "comment",
  entityId: string,
  file: File
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const supabase = await createClient();

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${entityType}/${entityId}/${Date.now()}.${fileExt}`;

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("attachments")
    .upload(fileName, file, {
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  // Create attachment record
  const { data, error } = await supabase
    .from("attachments")
    .insert({
      entity_type: entityType as any,
      entity_id: entityId,
      uploader_user_id: user.id,
      storage_path: uploadData.path,
      original_filename: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath(`/work-items/${entityId}`);
  return data;
}

export async function getAttachmentUrl(storagePath: string) {
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("attachments")
    .createSignedUrl(storagePath, 3600); // 1 hour expiry

  return data?.signedUrl;
}

export async function deleteAttachment(attachmentId: string, reason: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const supabase = await createClient();

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!canDeleteAttachments(profile?.role as UserRole)) {
    throw new Error("Forbidden");
  }

  // Get attachment
  const { data: attachment } = await supabase
    .from("attachments")
    .select("*")
    .eq("id", attachmentId)
    .single();

  if (!attachment) throw new Error("Attachment not found");

  // Soft delete
  const { error } = await supabase
    .from("attachments")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: user.id,
      delete_reason: reason,
    })
    .eq("id", attachmentId);

  if (error) throw error;

  // Hard delete from storage if admin
  if (profile?.role === UserRole.ADMIN) {
    await supabase.storage.from("attachments").remove([attachment.storage_path]);
  }

  revalidatePath(`/work-items/${attachment.entity_id}`);
}
