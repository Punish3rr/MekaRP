"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  createUser,
  deleteUser,
  updateUserRole,
} from "@/app/actions/users";
import { UserRole } from "@/types/auth";

interface Profile {
  id: string;
  user_id: string;
  role: string;
  full_name: string | null;
  created_at: string;
}

interface UserManagementClientProps {
  initialProfiles: Profile[];
}

export function UserManagementClient({
  initialProfiles,
}: UserManagementClientProps) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.PERSONNEL);

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await createUser({
        email: newUserEmail,
        password: newUserPassword,
        fullName: newUserFullName || null,
        role: newUserRole,
      });

      if (result.error) {
        setError(result.error);
      } else {
        window.location.reload();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await deleteUser(userId);
      if (result.error) {
        setError(result.error);
      } else {
        setProfiles(profiles.filter((p) => p.user_id !== userId));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateUserRole(userId, newRole);
      if (result.error) {
        setError(result.error);
      } else {
        setProfiles(
          profiles.map((p) =>
            p.user_id === userId ? { ...p, role: newRole } : p
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">All Users</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "Add User"}
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={newUserFullName}
                  onChange={(e) => setNewUserFullName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  id="role"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  required
                  disabled={loading}
                >
                  <option value={UserRole.ADMIN}>Admin</option>
                  <option value={UserRole.MANAGER}>Manager</option>
                  <option value={UserRole.MIDDLE_MANAGER}>Middle Manager</option>
                  <option value={UserRole.PERSONNEL}>Personnel</option>
                </Select>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create User"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4 text-left">User ID</th>
              <th className="p-4 text-left">Full Name</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Created</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              profiles.map((profile) => (
                <tr key={profile.id} className="border-b">
                  <td className="p-4 font-mono text-xs">{profile.user_id}</td>
                  <td className="p-4">{profile.full_name || "-"}</td>
                  <td className="p-4">
                    <Select
                      value={profile.role}
                      onChange={(e) =>
                        handleUpdateRole(profile.user_id, e.target.value as UserRole)
                      }
                      disabled={loading}
                      className="w-40"
                    >
                      <option value={UserRole.ADMIN}>Admin</option>
                      <option value={UserRole.MANAGER}>Manager</option>
                      <option value={UserRole.MIDDLE_MANAGER}>Middle Manager</option>
                      <option value={UserRole.PERSONNEL}>Personnel</option>
                    </Select>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(profile.user_id)}
                      disabled={loading}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
