"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { UserRole } from "@/types/auth";

export async function createOrder(formData: FormData) {
  await requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.MIDDLE_MANAGER]);
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const supabase = await createClient();

  const orderNumber = formData.get("order_number") as string;
  const customerId = formData.get("customer_id") as string;
  const projectName = formData.get("project_name") as string | null;
  const notes = formData.get("notes") as string | null;

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_id: customerId,
      project_name: projectName || null,
      notes: notes || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/orders");
  return order;
}

export async function createOrderItem(
  orderId: string,
  productId: string,
  quantity: number | null,
  note: string | null
) {
  await requireRole([UserRole.ADMIN, UserRole.MANAGER]);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("order_items")
    .insert({
      order_id: orderId,
      product_id: productId,
      quantity: quantity,
      note: note || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function cloneOrder(orderId: string) {
  await requireRole([UserRole.ADMIN, UserRole.MANAGER]);
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const supabase = await createClient();

  // Get original order
  const { data: originalOrder, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !originalOrder) throw orderError || new Error("Order not found");

  // Get order items
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  // Get work items and process steps
  const { data: workItems } = await supabase
    .from("work_items")
    .select(`
      *,
      work_item_process_steps (*)
    `)
    .eq("order_id", orderId);

  // Create new order
  const newOrderNumber = `${originalOrder.order_number}-COPY-${Date.now()}`;
  const { data: newOrder, error: newOrderError } = await supabase
    .from("orders")
    .insert({
      order_number: newOrderNumber,
      customer_id: originalOrder.customer_id,
      project_name: originalOrder.project_name,
      notes: originalOrder.notes,
      created_by: user.id,
    })
    .select()
    .single();

  if (newOrderError || !newOrder) throw newOrderError || new Error("Failed to create order");

  // Clone order items
  if (orderItems && orderItems.length > 0) {
    const newOrderItems = orderItems.map((item) => ({
      order_id: newOrder.id,
      product_id: item.product_id,
      quantity: item.quantity,
      note: item.note,
    }));

    await supabase.from("order_items").insert(newOrderItems);
  }

  // Clone work items with process steps
  if (workItems && workItems.length > 0) {
    for (const workItem of workItems) {
      const processSteps = workItem.work_item_process_steps as Array<{
        step_order: number;
        name: string;
        status: string;
      }>;

      const { data: newWorkItem } = await supabase
        .from("work_items")
        .insert({
          order_id: newOrder.id,
          workshop_id: workItem.workshop_id,
          title: workItem.title,
          description: workItem.description,
          current_status: "NEW",
          progress_step: 0,
          created_by: user.id,
        })
        .select()
        .single();

      if (newWorkItem && processSteps) {
        const newProcessSteps = processSteps.map((step) => ({
          work_item_id: newWorkItem.id,
          step_order: step.step_order,
          name: step.name,
          status: "PENDING",
        }));

        await supabase.from("work_item_process_steps").insert(newProcessSteps);
      }
    }
  }

  revalidatePath("/orders");
  return newOrder;
}
