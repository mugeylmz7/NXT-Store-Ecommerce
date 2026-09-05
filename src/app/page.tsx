import { Button } from "@/components/ui/button";
import { ProductCatalog } from "../components/storefront/product-catalog";
import Link from "next/link";
import { getAdmin, getSessionUser, isAdmin } from "@/lib/auth0-utils";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { Headphones, UserIcon } from "lucide-react";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;

  // Kullanıcı ve Admin durumunu çekiyoruz
  const user = await getSessionUser();
  const admin = await getAdmin();
  const userIsAdmin = isAdmin(user);
  const db = prisma as any;

  // Bildirim Sayılarını Hesaplama
  let pendingOrdersCount = 0;
  let userOrdersCount = 0;

  if (user && db.order) {
    try {
      if (admin) {
        // Admin için kargolanmayı bekleyen sipariş sayısı
        pendingOrdersCount = await db.order.count({
          where: { status: "PAID" },
        });
      } else {
        // Kullanıcı için verilmiş sipariş sayısı
        userOrdersCount = await db.order.count({
          where: {
            OR: [{ userId: user.id }, { userEmail: user.email }],
          },
        });
      }
    } catch (err) {
      console.error("Count fetch error:", err);
    }
  }


  // 2. DURUM: Kullanıcı Giriş Yapmışsa (Sol tarafta selamlama ve altında Ürün Kataloğu)
  return (
    <main className="container max-w-6xl mx-auto space-y-8 px-4 py-6 sm:px-6 sm:py-10 pb-12 md:pb-80 lg:pb-12">
      {/* ÜST HERO / KARŞILAMA ALANI */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-6 border border-border/80 rounded-3xl bg-gradient-to-r from-muted/50 via-background to-muted/30 shadow-sm">
        {user ? (
          <>
          {/* SOL TARAF: İsim / E-posta */}
            <div className="space-y-1 min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground break-all leading-snug">
                Welcome, {user.name || user.email || 'Guest'}! 👋
              </h1>
             <p className="text-xs sm:text-sm text-muted-foreground break-all">
                Logged in as <span className="font-semibold text-foreground">{user.email}</span>
              </p>
            </div>

            {/* SAĞ TARAF: MOBİLDE ALT ALTA / TABLET VE DESKTOP'TA YAN YANA BÜTÜNLEŞİK BUTONLAR */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/40">
              <Button asChild variant="outline" size="sm">
                <Link href="/user/profile" className="flex items-center gap-1.5">
                <UserIcon className="size-3.5 sm:size-4 shrink-0" />My Profile</Link>
              </Button>

              {userIsAdmin ? (
                <Button asChild size="sm">
                  <Link href="/admin/products">
                    Admin Dashboard
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="default" size="sm" >
                  <Link href="/user/orders" className="flex items-center gap-1.5">
                    <span>My Orders</span>
                  </Link>
                </Button>
              )}

              {/* DESTEK / SUPPORT BUTONU */}
              <Button asChild variant="outline" size="sm" >
                <Link href="/support" className="flex items-center gap-1.5">
                  <Headphones className="size-3.5 sm:size-4" />
                  <span>Support</span>
                </Link>
              </Button>
            </div>
          </>
        ) : ( 
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4 ">
        <div className="space-y-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Welcome to NXT Store! 🛒
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse our product catalog below. Login to make purchases and manage orders.
          </p>
        </div>
      </div>
        )}
    </div>

      {/* ÜRÜN KATALOĞU (Giriş yapan/yapmayan herkes için görünür) */ }
  <div className="space-y-4">
    <div className="space-y-1">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
        Products
      </h2>
      <p className="text-sm text-muted-foreground">
        Browse our catalog. Filter by category or sort by name and price.
      </p>
    </div>

    {/* Ürün Kataloğu */}
    <ProductCatalog searchParams={resolvedSearchParams} />
  </div>
    </main >
  );
}