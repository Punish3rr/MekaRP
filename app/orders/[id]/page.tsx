import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { cloneOrder } from "@/app/actions/orders";
import { CloneOrderButton } from "./clone-button";

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      customers (*),
      order_items (
        *,
        products (*)
      ),
      work_items (
        *,
        workshops (*)
      )
    `)
    .eq("id", params.id)
    .single();

  if (!order) {
    return <div>Order not found</div>;
  }

  const customer = order.customers as { name: string; phone: string | null };
  const orderItems = order.order_items as Array<{
    id: string;
    quantity: number | null;
    note: string | null;
    products: { name: string };
  }>;
  const workItems = order.work_items as Array<{
    id: string;
    title: string | null;
    current_status: string;
    workshops: { name: string };
  }>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Order {order.order_number}</h1>
        <div className="flex gap-2">
          <CloneOrderButton orderId={params.id} />
          <Link href="/orders">
            <Button variant="outline">Back to Orders</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <strong>Customer:</strong> {customer.name}
          </div>
          {customer.phone && (
            <div>
              <strong>Phone:</strong> {customer.phone}
            </div>
          )}
          {order.project_name && (
            <div>
              <strong>Project Name:</strong> {order.project_name}
            </div>
          )}
          {order.notes && (
            <div>
              <strong>Notes:</strong> {order.notes}
            </div>
          )}
          <div>
            <strong>Created:</strong> {new Date(order.created_at).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-left">Quantity</th>
                <th className="p-2 text-left">Note</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-2">{item.products.name}</td>
                  <td className="p-2">{item.quantity || "-"}</td>
                  <td className="p-2">{item.note || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Work Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {workItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b pb-2"
              >
                <div>
                  <div className="font-medium">
                    {item.title || "Untitled Work Item"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {(item.workshops as { name: string }).name} - {item.current_status}
                  </div>
                </div>
                <Link href={`/work-items/${item.id}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
