import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { UserManagementClient } from "./user-management-client";

export default async function UsersPage() {
  await requireRole([UserRole.ADMIN]);
  const supabase = await createClient();

  // Get all profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <UserManagementClient initialProfiles={profiles || []} />
        </CardContent>
      </Card>
    </div>
  );
}
