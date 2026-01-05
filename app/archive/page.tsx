import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  ASSIGNED: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  ON_HOLD: "bg-orange-100 text-orange-800",
  DONE: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function ArchivePage() {
  const supabase = await createClient();

  const { data: workItems } = await supabase
    .from("work_items")
    .select(`
      *,
      orders!inner (
        order_number,
        customers (
          name
        )
      ),
      workshops (
        name
      )
    `)
    .not("archived_at", "is", null)
    .order("archived_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Archive</h1>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Order</th>
              <th className="p-4 text-left">Workshop</th>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Archived</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {workItems?.map((item) => {
              const order = item.orders as { order_number: string; customers: { name: string } };
              const workshop = item.workshops as { name: string };
              return (
                <tr key={item.id} className="border-b">
                  <td className="p-4">
                    <div className="font-medium">{order.order_number}</div>
                    <div className="text-sm text-gray-500">
                      {(order.customers as { name: string })?.name}
                    </div>
                  </td>
                  <td className="p-4">{workshop.name}</td>
                  <td className="p-4">{item.title || "-"}</td>
                  <td className="p-4">
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${
                        STATUS_COLORS[item.current_status] || ""
                      }`}
                    >
                      {item.current_status}
                    </span>
                  </td>
                  <td className="p-4">
                    {item.archived_at
                      ? new Date(item.archived_at).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/work-items/${item.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
