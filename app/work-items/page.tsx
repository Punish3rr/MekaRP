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

export default async function WorkItemsPage({
  searchParams,
}: {
  searchParams: { workshop?: string; personnel?: string };
}) {
  const supabase = await createClient();

  let query = supabase
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
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (searchParams.workshop) {
    query = query.eq("workshop_id", searchParams.workshop);
  }

  if (searchParams.personnel) {
    query = query.eq("assigned_personnel_id", searchParams.personnel);
  }

  const { data: workItems } = await query;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Work Items</h1>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Order</th>
              <th className="p-4 text-left">Workshop</th>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Progress</th>
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
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-blue-600 rounded-full"
                          style={{ width: `${item.progress_step * 10}%` }}
                        />
                      </div>
                      <span className="text-sm">{item.progress_step * 10}%</span>
                    </div>
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
