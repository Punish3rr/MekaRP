"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

interface NavbarProps {
  userRole: string;
}

export function Navbar({ userRole }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">Work Tracking</h1>
            <div className="flex gap-4">
              <a href="/dashboard" className="text-sm hover:underline">
                Dashboard
              </a>
              <a href="/orders" className="text-sm hover:underline">
                Orders
              </a>
              <a href="/work-items" className="text-sm hover:underline">
                Work Items
              </a>
              {userRole === "ADMIN" || userRole === "MANAGER" ? (
                <>
                  <a href="/customers" className="text-sm hover:underline">
                    Customers
                  </a>
                  <a href="/products" className="text-sm hover:underline">
                    Products
                  </a>
                  <a href="/workshops" className="text-sm hover:underline">
                    Workshops
                  </a>
                  <a href="/audit" className="text-sm hover:underline">
                    Audit
                  </a>
                </>
              ) : null}
              {userRole === "ADMIN" ? (
                <a href="/users" className="text-sm hover:underline">
                  Users
                </a>
              ) : null}
              <a href="/archive" className="text-sm hover:underline">
                Archive
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/notifications">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </a>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
