import { getCurrentProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) {
    // If user exists but no profile, they need to wait for profile creation
    // or have an admin create it
    redirect("/login?error=no_profile");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={profile.role} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
