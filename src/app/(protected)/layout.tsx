import { requireUser } from "@/lib/auth0";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ecommerce",
  description: "Ecommerce platform",
};

export default async function LoggedInUserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // Sayfa yüklenmeden önce kullanıcının giriş yapıp yapmadığını kontrol ediyoruz
  await requireUser();
  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      {children}
    </div>
  );
}
