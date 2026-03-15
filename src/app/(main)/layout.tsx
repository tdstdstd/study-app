import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-bg-primary">
      <Sidebar />
      <main className="lg:pl-64 pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto p-4 lg:p-8">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}