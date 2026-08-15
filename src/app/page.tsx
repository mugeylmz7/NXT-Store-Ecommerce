import { Button } from "@/components/ui/button";
import { ProductCatalog } from "../components/storefront/product-catalog";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth0-utils";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;

  // Kullanıcı oturumunu çekiyoruz
  const user = await getSessionUser();
// 1. DURUM: Kullanıcı Giriş Yapmamışsa (Sadece Ortalanmış Hoş Geldiniz Ekranı)
  if (!user) {
    return (
      <main className="flex min-h-[75vh] flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-primary to-slate-500 bg-clip-text text-transparent">
            Welcome to NXT Store!
          </h1>
          <p className="text-lg text-muted-foreground">
            Your ultimate destination for modern, fast, and secure online shopping. Please login to browse our products.
          </p>
          <div className="pt-2">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/auth/login">Login / Sign Up</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // 2. DURUM: Kullanıcı Giriş Yapmışsa (Sol tarafta selamlama ve altında Ürün Kataloğu)
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      
      {/* Sol tarafta şık ve kısa selamlama alanı */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome, {user.name || user.email || 'Guest'}! 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Logged in as <span className="font-medium text-foreground">{user.email}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/user/profile">My Profile</Link>
          </Button>
        </div>
      </div>

      <hr className="border-muted" />

      {/* 2. BÖLÜM: ÜRÜN KATALOĞU (Asıl İçerik) */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Products
          </h2>
          <p className="text-sm text-muted-foreground">
            Browse our catalog. Filter by category or sort by name and price.
          </p>
        </div>

        {/* Ürünler buraya yükleniyor */}
        <ProductCatalog searchParams={resolvedSearchParams} />
      </div>

    </main>
  );
}
