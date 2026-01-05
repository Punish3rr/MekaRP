"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file."
  );
}

// Use createBrowserClient from @supabase/ssr to ensure sessions are stored in cookies
// that can be read by server-side code (middleware, server components)
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
