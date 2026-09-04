import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { requireAdmin } from "@/lib/auth0-utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  description: "Admin ecommerce platform",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();

 return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-background">
      {/* Mobil Üst Bar / Masaüstü Sidebar */}
      <AdminSidebar />

      {/* Tümüyle Doğal Kaydırılabilir Alan */}
      <main className="container max-w-5xl mx-auto space-y-6 px-6">
        <div className="mx-auto max-w-5xl space-y-6 pb-6">
          {children}
        </div>
      </main>
    </div>
  );
}