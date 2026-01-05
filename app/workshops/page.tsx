import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/types/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function WorkshopsPage() {
  await requireRole([UserRole.ADMIN, UserRole.MANAGER]);
  const supabase = await createClient();

  const { data: workshops } = await supabase
    .from("workshops")
    .select("*")
    .order("name");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Workshops</h1>
        <Link href="/workshops/new">
          <Button>New Workshop</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Location</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {workshops?.map((workshop) => (
              <tr key={workshop.id} className="border-b">
                <td className="p-4">{workshop.name}</td>
                <td className="p-4">{workshop.location || "-"}</td>
                <td className="p-4">
                  {workshop.is_active ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-gray-400">Inactive</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <Link href={`/workshops/${workshop.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
