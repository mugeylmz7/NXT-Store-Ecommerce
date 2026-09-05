"use client";

import { Button } from "@/components/ui/button";
import { clearCart } from "@/lib/cart-store";

export function LogoutButton() {
  const handleLogout = () => {
    // 1. Kullanıcı çıkış yaparken yerel sepeti tamamen sıfırla
    clearCart();
    window.dispatchEvent(new Event("cart-updated"));

    // 2. Auth0 çıkış bağlantısına yönlendir
    window.location.href = "/auth/logout";
  };

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1.5">
      Log out
    </Button>
  );
}