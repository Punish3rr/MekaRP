import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get counts by status
  const { data: statusCounts } = await supabase
    .from("work_items")
    .select("current_status")
    .is("archived_at", null);

  const counts = statusCounts?.reduce(
    (acc, item) => {
      acc[item.current_status] = (acc[item.current_status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  ) || {};

  // Get overdue ON_HOLD items
  const { data: overdueItems } = await supabase
    .from("work_items")
    .select("id")
    .eq("current_status", "ON_HOLD")
    .is("archived_at", null)
    .lt("updated_at", new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString());

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.NEW || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.IN_PROGRESS || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Hold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.ON_HOLD || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Done</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.DONE || 0}</div>
          </CardContent>
        </Card>
      </div>

      {overdueItems && overdueItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Overdue ON_HOLD Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              {overdueItems.length} items on hold for more than 3 days
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
