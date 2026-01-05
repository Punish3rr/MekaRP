import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/types/auth";

export default async function AuditPage() {
  await requireRole([UserRole.ADMIN, UserRole.MANAGER]);
  const supabase = await createClient();

  const { data: auditLogs } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Audit Log</h1>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Time</th>
              <th className="p-4 text-left">Action</th>
              <th className="p-4 text-left">Entity Type</th>
              <th className="p-4 text-left">Entity ID</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs?.map((log) => (
              <tr key={log.id} className="border-b">
                <td className="p-4 text-sm">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="p-4">{log.action}</td>
                <td className="p-4">{log.entity_type}</td>
                <td className="p-4 font-mono text-sm">{log.entity_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
