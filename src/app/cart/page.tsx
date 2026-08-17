'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { CheckoutButton } from "@/components/storefront/checkout-button";
import { CartItem, getCart } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const updateCartState = () => {
    setCartItems(getCart());
  };

  useEffect(() => {
    updateCartState();
    window.addEventListener("cart-updated", updateCartState);
    return () => window.removeEventListener("cart-updated", updateCartState);
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-emerald-500" /> Your Shopping Cart
        </h1>
      </div>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sol Taraf: Sepetteki Ürünler Listesi */}
          <div className="md:col-span-2 space-y-4 divide-y">
            {cartItems.map((item) => (
              <div key={item.stripePriceId} className="pt-4 first:pt-0 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-base">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                </div>
                <CheckoutButton 
                  mode="remove-item" 
                  productInfo={{ stripePriceId: item.stripePriceId, name: item.name || "Product" }} 
                />
              </div>
            ))}
          </div>

          {/* Sağ Taraf: Özet ve Checkout Butonları */}
          <div className="p-6 border rounded-2xl bg-card space-y-4 h-fit shadow-sm">
            <h2 className="font-semibold text-lg border-b pb-2">Order Summary</h2>
            <div className="flex justify-between text-sm">
              <span>Total Items:</span>
              <span className="font-bold">{cartItems.reduce((acc, item) => acc + item.quantity, 0)}</span>
            </div>
            <div className="space-y-2 pt-2">
              <CheckoutButton mode="checkout-cart" />
              <CheckoutButton mode="clear-cart" />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 space-y-4">
          <p className="text-muted-foreground">Your cart is currently empty.</p>
          <Button asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      )}
    </main>
  );
}