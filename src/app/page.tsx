import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth0";
import Link from "next/link";

export default async function HomePage() {
  // Kullanıcı oturumunu çekiyoruz
  const user = await getSessionUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Welcome to the NXT Store!
        </h1>
        <p className="text-lg text-muted-foreground">
          This is a simple e-commerce application built with Next.js, TypeScript, and Tailwind CSS. You can browse products, add them to your cart, and proceed to checkout. Enjoy your shopping experience!
        </p>

        <div className="flex justify-center gap-4">
          {/* DURUM 1: Kullanıcı Giriş YAPMAMIŞSA */}
          {!user ? (
            <Button asChild size="lg">
              <Link href="/auth/login">Login / Sign Up</Link>
            </Button>
          ) : (
            /* DURUM 2: Kullanıcı ZATEN GİRİŞ YAPMIŞSA */
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm font-medium text-muted-foreground">
                Logged in as: <span className="text-foreground font-semibold">{user?.name || user?.email || 'User'}</span>
              </p>
              <div className="flex gap-4">
                <Button asChild variant="default" size="lg">
                  <Link href="/user/profile">View Profile</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/auth/logout">Logout</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}