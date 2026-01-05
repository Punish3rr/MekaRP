import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/types/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function CustomersPage() {
  await requireRole([UserRole.ADMIN, UserRole.MANAGER]);
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("name");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Link href="/customers/new">
          <Button>New Customer</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Note</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers?.map((customer) => (
              <tr key={customer.id} className="border-b">
                <td className="p-4">{customer.name}</td>
                <td className="p-4">{customer.phone || "-"}</td>
                <td className="p-4">{customer.note || "-"}</td>
                <td className="p-4 text-right">
                  <Link href={`/customers/${customer.id}/edit`}>
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
