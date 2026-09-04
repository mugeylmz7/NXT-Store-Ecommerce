"use client";

import { useEffect } from "react";
import { clearCart } from "@/lib/cart-store";

export function CartSyncOnAuth() {
  useEffect(() => {
    // Tarayıcıdaki oturum izini kontrol et
    const currentSession = document.cookie
      .split("; ")
      .find((row) => row.startsWith("appSession="))
      ?.split("=")[1];

    const lastSession = localStorage.getItem("nxt_active_session");

    // Oturum değişmişse (farklı bir kullanıcı giriş yapmışsa) sepeti temizle
    if (lastSession && currentSession && lastSession !== currentSession) {
      clearCart();
      window.dispatchEvent(new Event("cart-updated"));
    }

    if (currentSession) {
      localStorage.setItem("nxt_active_session", currentSession);
    } else {
      // Oturum kapandıysa oturum izini sil
      localStorage.removeItem("nxt_active_session");
    }
  }, []);

  return null;
}