import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/types/auth";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !data) return null;
  return data;
}

export async function requireAuth() {
  const profile = await getCurrentProfile();
  if (!profile) {
    throw new Error("Unauthorized");
  }
  return profile;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const profile = await requireAuth();
  if (!allowedRoles.includes(profile.role as UserRole)) {
    throw new Error("Forbidden");
  }
  return profile;
}

export function canManageOrders(role: UserRole): boolean {
  return ["ADMIN", "MANAGER", "MIDDLE_MANAGER"].includes(role);
}

export function canManageWorkItems(role: UserRole): boolean {
  return ["ADMIN", "MANAGER", "MIDDLE_MANAGER"].includes(role);
}

export function canApproveUpdates(role: UserRole): boolean {
  return ["ADMIN", "MANAGER", "MIDDLE_MANAGER"].includes(role);
}

export function canDeleteAttachments(role: UserRole): boolean {
  return ["ADMIN", "MANAGER"].includes(role);
}

export function canRevertStatus(role: UserRole): boolean {
  return ["ADMIN", "MANAGER"].includes(role);
}

export function canViewAudit(role: UserRole): boolean {
  return ["ADMIN", "MANAGER"].includes(role);
}
