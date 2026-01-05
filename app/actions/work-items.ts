"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { UserRole } from "@/types/auth";

export async function createWorkItem(formData: FormData) {
  await requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.MIDDLE_MANAGER]);
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const supabase = await createClient();

  const orderId = formData.get("order_id") as string;
  const workshopId = formData.get("workshop_id") as string;
  const title = formData.get("title") as string | null;
  const description = formData.get("description") as string | null;

  const { data, error } = await supabase
    .from("work_items")
    .insert({
      order_id: orderId,
      workshop_id: workshopId,
      title: title || null,
      description: description || null,
      current_status: "NEW",
      progress_step: 0,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/work-items");
  return data;
}

export async function updateWorkItemStatus(
  workItemId: string,
  status: string,
  progressStep: number,
  note: string | null
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const supabase = await createClient();

  // Get current work item
  const { data: currentItem } = await supabase
    .from("work_items")
    .select("*")
    .eq("id", workItemId)
    .single();

  if (!currentItem) throw new Error("Work item not found");

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const userRole = profile?.role as UserRole;

  // If PERSONNEL, create pending update
  if (userRole === UserRole.PERSONNEL) {
    const { data, error } = await supabase
      .from("work_item_updates")
      .insert({
        work_item_id: workItemId,
        requested_by_user_id: user.id,
        requested_status: status as any,
        requested_progress_step: progressStep,
        requested_note: note || null,
        state: "PENDING",
      })
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/work-items");
    return { pending: true, update: data };
  }

  // Otherwise, apply directly
  const { data, error } = await supabase
    .from("work_items")
    .update({
      current_status: status as any,
      progress_step: progressStep,
      updated_by: user.id,
    })
    .eq("id", workItemId)
    .select()
    .single();

  if (error) throw error;

  // Create status history
  await supabase.from("work_item_status_history").insert({
    work_item_id: workItemId,
    actor_user_id: user.id,
    from_status: currentItem.current_status as any,
    to_status: status as any,
    from_progress_step: currentItem.progress_step,
    to_progress_step: progressStep,
    note: note || null,
  });

  // Auto-archive if DONE or CANCELLED
  if (status === "DONE" || status === "CANCELLED") {
    await supabase
      .from("work_items")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", workItemId);
  }

  revalidatePath("/work-items");
  return { pending: false, workItem: data };
}

export async function approveWorkItemUpdate(updateId: string, approved: boolean, reviewNote: string | null) {
  await requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.MIDDLE_MANAGER]);
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const supabase = await createClient();

  // Get the update
  const { data: update } = await supabase
    .from("work_item_updates")
    .select("*")
    .eq("id", updateId)
    .single();

  if (!update) throw new Error("Update not found");

  // Update the update record
  await supabase
    .from("work_item_updates")
    .update({
      state: approved ? "APPROVED" : "REJECTED",
      reviewer_user_id: user.id,
      reviewed_at: new Date().toISOString(),
      review_note: reviewNote || null,
    })
    .eq("id", updateId);

  if (approved) {
    // Get current work item
    const { data: currentItem } = await supabase
      .from("work_items")
      .select("*")
      .eq("id", update.work_item_id)
      .single();

    if (!currentItem) throw new Error("Work item not found");

    // Apply the update
    const { data: workItem } = await supabase
      .from("work_items")
      .update({
        current_status: update.requested_status as any,
        progress_step: update.requested_progress_step || currentItem.progress_step,
        updated_by: user.id,
      })
      .eq("id", update.work_item_id)
      .select()
      .single();

    // Create status history
    await supabase.from("work_item_status_history").insert({
      work_item_id: update.work_item_id,
      actor_user_id: update.requested_by_user_id,
      from_status: currentItem.current_status as any,
      to_status: update.requested_status as any,
      from_progress_step: currentItem.progress_step,
      to_progress_step: update.requested_progress_step || currentItem.progress_step,
      note: update.requested_note || null,
    });

    // Auto-archive if DONE or CANCELLED
    if (update.requested_status === "DONE" || update.requested_status === "CANCELLED") {
      await supabase
        .from("work_items")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", update.work_item_id);
    }

    revalidatePath("/work-items");
    return workItem;
  }

  revalidatePath("/work-items");
  return null;
}
