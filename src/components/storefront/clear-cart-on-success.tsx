"use client";

import { useEffect } from "react";
import { clearCart } from "@/lib/cart-store"; 


export function ClearCartOnSuccess (){
  useEffect(() => {
    // Sayfaya başarıyla erişildiğinde sepeti ve event'i tetikle
    clearCart();
    window.dispatchEvent(new Event("cart-updated"));
}, []);

  return null; 
}