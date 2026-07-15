import { requireAdmin } from "@/lib/auth0";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ecommerce Admin",
  description: "Admin ecommerce platform",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

// Sayfa veya altındaki herhangi bir bileşen render edilmeden önce admin kontrolü yapılır
  await requireAdmin();
  return (
    <>
      {/* Eğer yetki varsa, içerik burada gösterilir */}
      {children}
    </>
  );
}
