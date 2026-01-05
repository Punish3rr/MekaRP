"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateWorkItemStatus } from "@/app/actions/work-items";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { UserRole } from "@/types/auth";

interface WorkItemStatusFormProps {
  workItemId: string;
  currentStatus: string;
  currentProgress: number;
  userRole: string;
}

export function WorkItemStatusForm({
  workItemId,
  currentStatus,
  currentProgress,
  userRole,
}: WorkItemStatusFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [progress, setProgress] = useState(currentProgress);
  const [note, setNote] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateWorkItemStatus(workItemId, status, progress, note || null);
      if (result.pending) {
        alert("Update submitted for approval");
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to update work item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={loading}
        >
          <option value="NEW">New</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="DONE">Done</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="progress">Progress (0-10, representing 0-100%)</Label>
        <Input
          id="progress"
          type="number"
          min="0"
          max="10"
          value={progress}
          onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
          disabled={loading}
        />
        <div className="text-sm text-gray-500">
          Current: {progress * 10}%
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          disabled={loading}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading
          ? "Updating..."
          : userRole === UserRole.PERSONNEL
          ? "Submit for Approval"
          : "Update Status"}
      </Button>

      {userRole === UserRole.PERSONNEL && (
        <p className="text-sm text-gray-500">
          Your update will require approval from a manager.
        </p>
      )}
    </form>
  );
}
