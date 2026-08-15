import { getSessionUser, isAdmin } from "@/lib/auth0-utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";

import { CartDropdown } from "./ui/cart-dropdown";

export default async function Header() {
  const user = await getSessionUser(); // Kullanıcı oturumunu kontrol ediyoruz
  const userIsAdmin = isAdmin(user); // Admin olup olmadığını kontrol ediyoruz

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Sol Taraf: Logo */}
        <Button variant="link" asChild>
          <Link href="/" className="text-xl font-bold text-primary">
            NXT Store
          </Link>
        </Button>

        {/* Sağ Taraf: Navigasyon ve Butonlar */}
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline-block">
                Hello, {user.name || user.email}
              </span>

              {userIsAdmin && (
                <Button variant="link" asChild>
                  <Link href="/admin" className="text-sm font-medium hover:underline dark:text-primary">
                    Admin Dashboard
                  </Link>
                </Button>
              )}

              <Button variant="outline" asChild>
                <a href="/auth/logout">Log out</a>
              </Button>

            </>
          ) : (
            <Button asChild>
              <a href="/auth/login">Log in / Sign up</a>
            </Button>
          )}
          {/* Sağ Üst Kısım: Her Zaman Görünür Sepet ve Tema Değiştirici */}
          <div className="flex items-center gap-2 pl-2 border-l border-border/40">
            <CartDropdown />
            <ModeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}