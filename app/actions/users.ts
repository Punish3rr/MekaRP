"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/types/auth";
import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// Admin client for user management (requires service role key)
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase service role key. Add SUPABASE_SERVICE_ROLE_KEY to .env.local"
    );
  }

  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

interface CreateUserParams {
  email: string;
  password: string;
  fullName: string | null;
  role: UserRole;
}

export async function createUser(params: CreateUserParams) {
  await requireRole([UserRole.ADMIN]);

  try {
    const adminClient = getAdminClient();

    // Create user in auth.users
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: params.email,
      password: params.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: params.fullName,
      },
    });

    if (authError) {
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: "Failed to create user" };
    }

    // Create or update profile using admin client to bypass RLS
    // The trigger may have already created it with default role, so use upsert
    const { error: profileError } = await adminClient
      .from("profiles")
      .upsert({
        user_id: authData.user.id,
        role: params.role,
        full_name: params.fullName,
      }, {
        onConflict: "user_id",
      });

    if (profileError) {
      // Clean up: delete the auth user if profile creation fails
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return { error: `Failed to create profile: ${profileError.message}` };
    }

    revalidatePath("/users");
    return { success: true, userId: authData.user.id };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to create user",
    };
  }
}

export async function deleteUser(userId: string) {
  await requireRole([UserRole.ADMIN]);

  try {
    const adminClient = getAdminClient();

    // Delete profile first using admin client to bypass RLS (due to foreign key constraint)
    const { error: profileError } = await adminClient
      .from("profiles")
      .delete()
      .eq("user_id", userId);

    if (profileError) {
      return { error: `Failed to delete profile: ${profileError.message}` };
    }

    // Delete user from auth
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId);

    if (authError) {
      return { error: `Failed to delete user: ${authError.message}` };
    }

    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to delete user",
    };
  }
}

export async function updateUserRole(userId: string, role: UserRole) {
  await requireRole([UserRole.ADMIN]);

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("user_id", userId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update role",
    };
  }
}
