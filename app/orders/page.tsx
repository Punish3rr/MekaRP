import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      customers (
        name
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Link href="/orders/new">
          <Button>New Order</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Order Number</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Project Name</th>
              <th className="p-4 text-left">Created</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="p-4 font-medium">{order.order_number}</td>
                <td className="p-4">
                  {(order.customers as { name: string })?.name || "-"}
                </td>
                <td className="p-4">{order.project_name || "-"}</td>
                <td className="p-4">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="outline" size="sm">
                      View
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
