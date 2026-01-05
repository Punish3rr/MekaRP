import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { WorkItemStatusForm } from "./status-form";
import { getCurrentProfile } from "@/lib/auth";

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  ASSIGNED: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  ON_HOLD: "bg-orange-100 text-orange-800",
  DONE: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function WorkItemDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: workItem } = await supabase
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
      ),
      work_item_process_steps (
        *
        ORDER BY step_order ASC
      )
    `)
    .eq("id", params.id)
    .single();

  if (!workItem) {
    return <div>Work item not found</div>;
  }

  const order = workItem.orders as {
    order_number: string;
    customers: { name: string };
  };
  const workshop = workItem.workshops as { name: string };
  const processSteps = (workItem.work_item_process_steps as Array<{
    id: string;
    step_order: number;
    name: string;
    status: string;
  }>) || [];

  // Get status history
  const { data: statusHistory } = await supabase
    .from("work_item_status_history")
    .select("*")
    .eq("work_item_id", params.id)
    .order("created_at", { ascending: false })
    .limit(20);

  // Get pending updates if any
  const { data: pendingUpdates } = await supabase
    .from("work_item_updates")
    .select("*")
    .eq("work_item_id", params.id)
    .eq("state", "PENDING");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Work Item: {workItem.title || "Untitled"}
        </h1>
        <Link href="/work-items">
          <Button variant="outline">Back to Work Items</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <strong>Order:</strong> {order.order_number}
            </div>
            <div>
              <strong>Customer:</strong> {(order.customers as { name: string }).name}
            </div>
            <div>
              <strong>Workshop:</strong> {workshop.name}
            </div>
            <div>
              <strong>Status:</strong>{" "}
              <span
                className={`rounded px-2 py-1 text-xs font-medium ${
                  STATUS_COLORS[workItem.current_status] || ""
                }`}
              >
                {workItem.current_status}
              </span>
            </div>
            <div>
              <strong>Progress:</strong> {workItem.progress_step * 10}%
              <div className="mt-1 h-2 w-full bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-blue-600 rounded-full"
                  style={{ width: `${workItem.progress_step * 10}%` }}
                />
              </div>
            </div>
            {workItem.description && (
              <div>
                <strong>Description:</strong>
                <p className="mt-1">{workItem.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Process Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {processSteps.length === 0 ? (
                <p className="text-sm text-gray-500">No process steps defined</p>
              ) : (
                processSteps.map((step) => (
                  <div
                    key={step.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <div className="font-medium">
                        {step.step_order}. {step.name}
                      </div>
                    </div>
                    <span
                      className={`rounded px-2 py-1 text-xs ${
                        step.status === "DONE"
                          ? "bg-green-100 text-green-800"
                          : step.status === "ACTIVE"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {pendingUpdates && pendingUpdates.length > 0 && profile?.role !== "PERSONNEL" && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingUpdates.map((update) => (
                <div key={update.id} className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div>
                        Status: {update.requested_status} | Progress:{" "}
                        {(update.requested_progress_step || 0) * 10}%
                      </div>
                      {update.requested_note && (
                        <div className="text-sm text-gray-600 mt-1">
                          {update.requested_note}
                        </div>
                      )}
                    </div>
                    {/* TODO: Add approve/reject buttons */}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Update Status & Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkItemStatusForm
            workItemId={params.id}
            currentStatus={workItem.current_status}
            currentProgress={workItem.progress_step}
            userRole={profile?.role || "PERSONNEL"}
          />
        </CardContent>
      </Card>

      {statusHistory && statusHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Status History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {statusHistory.map((history) => (
                <div key={history.id} className="border-b pb-2 text-sm">
                  <div>
                    {history.from_status} → {history.to_status}
                  </div>
                  <div className="text-gray-500">
                    Progress: {history.from_progress_step * 10}% →{" "}
                    {history.to_progress_step * 10}%
                  </div>
                  {history.note && (
                    <div className="text-gray-600 mt-1">{history.note}</div>
                  )}
                  <div className="text-gray-400 text-xs mt-1">
                    {new Date(history.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
