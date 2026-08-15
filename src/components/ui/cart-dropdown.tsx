'use client';

import { useEffect, useState } from "react";
import { ShoppingBag, X } from "lucide-react";
import { CheckoutButton } from "@/components/storefront/checkout-button";
import { CartItem, getCart } from "@/lib/cart-store";

export function CartDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Sepetteki ürünleri kendi cart-store yapından yükleme
  const updateCartState = () => {
    const currentCart = getCart();
    setCartItems(currentCart);
  };

  useEffect(() => {
    updateCartState();
    
    // Sepete ürün eklendiğinde/çıkarıldığında anında güncelle
    window.addEventListener("cart-updated", updateCartState);
    return () => window.removeEventListener("cart-updated", updateCartState);
  }, []);

  // Toplam Ürün Adedi
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="relative inline-block text-left">
      {/* SEPET İKONU */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center p-2.5 rounded-full border border-border/60 bg-background hover:bg-muted/60 text-foreground shadow-sm hover:shadow-md transition-all duration-200 ease-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Shopping Cart"
      >
        <ShoppingBag className="w-4 h-4 text-foreground transition-transform duration-200 group-hover:scale-105" />

      {/* Sepet Boş Değilse Üstünde Yeşil Rozet Belirir */}
        {totalItemsCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
            {totalItemsCount}
          </span>
        )}
      </button>


      {/* AÇILIR SEPET MENÜSÜ */}
      {isOpen && (
        <>
          {/* Ekranın dışına tıklandığında kapanması için transparan katman */}
          <div 
            className="fixed inset-0 z-40 cursor-default" 
            onClick={() => setIsOpen(false)} 
          />

          <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-border bg-popover p-5 shadow-xl z-50 animate-in fade-in-50 zoom-in-95 duration-150">
            {/* Başlık ve Kapat Butonu */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-500" />
                <h3 className="font-semibold text-sm text-popover-foreground">Your Shopping Cart</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/*  EKLENEN ÜRÜNLERİN LİSTELENDİĞİ CANLI ALAN */}
            <div className="max-h-64 overflow-y-auto my-2 space-y-3 pr-1 divide-y divide-border/40">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div key={item.stripePriceId} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                    {/* Ürün Detayları */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <p className="font-medium text-xs text-foreground truncate leading-snug">{item.name}</p>
                      <span className="text-[11px] text-muted-foreground mt-0.5">
                        Quantity: <strong className="text-foreground">{item.quantity}</strong>
                      </span>
                    </div>
                    
                    {/* Tekil Ürün Silme Butonu (Mevcut CheckoutButton modunu kullanır) */}
                    <div className="shrink-0 scale-90 origin-right">
                      <CheckoutButton 
                        mode="remove-item" 
                        productInfo={{ stripePriceId: item.stripePriceId, name: item.name || "Product" }} 
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-xs text-muted-foreground">Your cart is currently empty.</p>
                </div>
              )}
            </div>

            {/* SEPET YÖNETİM VE BUTON ALANI */}
            <div className="space-y-4">
              {/* Reset Cart & Pay Total Butonları */}
              <div className="flex items-center gap-3 pt-3 border-t border-border/60 mt-3">
                <div className="w-1/3" onClick={() => setIsOpen(false)}>
                  <CheckoutButton mode="clear-cart" />
                </div>
                <div className="w-2/3" onClick={() => setIsOpen(false)}>
                  <CheckoutButton mode="checkout-cart" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}