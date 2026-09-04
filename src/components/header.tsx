import { getSessionUser, isAdmin } from "@/lib/auth0-utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";

import { CartDropdown } from "./ui/cart-dropdown";
import { NotificationDropdown } from "./ui/notification-dropdown";
import { LogoutButton } from "./logout-button"; // İstemci bileşeni

export default async function Header() {
  const user = await getSessionUser(); // Kullanıcı oturumunu kontrol ediyoruz
  const userIsAdmin = isAdmin(user); // Admin olup olmadığını kontrol ediyoruz


  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Sol Taraf: Logo */}
        <Link href="/" className="text-lg sm:text-xl font-bold text-primary shrink-0">
          NXT Store
        </Link>

        {/* Sağ Taraf: Navigasyon ve Butonlar */}
        <nav className="flex items-center gap-1.5 sm:gap-3">
          {user ? (
            <>
              {/* Çıkış Yaparken Sepeti Temizleyen Buton */}
              <LogoutButton />

            </>
          ) : (
            <Button asChild size="sm" className="text-xs sm:text-sm px-4 sm:px-4 rounded-xl">
              <a href="/auth/login">
              <span className="hidden sm:inline">Log in / Sign up</span>
                <span className="sm:hidden ">Log in / Sign up</span>
              </a>
            </Button>
          )}
          {/* Sağ Üst Kısım: Her Zaman Görünür Sepet ve Tema Değiştirici */}
          <div className="flex items-center gap-1 sm:gap-2 pl-1.5 sm:pl-2 border-l border-border/40">
            {user && (
              <NotificationDropdown userIsAdmin={userIsAdmin} />
            )}
            <CartDropdown />
            <ModeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}