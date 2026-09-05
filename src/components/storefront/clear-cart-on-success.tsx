"use client";

import { useEffect } from "react";
import { clearCart } from "@/lib/cart-store";

export function ClearCartOnSuccess() {
  useEffect(() => {
    clearCart();
  }, []);

  return null;
}