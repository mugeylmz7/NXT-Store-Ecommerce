'use client';

import { useEffect, useState } from "react";
import { ShoppingBag, ShoppingCart, Sparkles, X } from "lucide-react";
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
      {/* SEPET İKONU (Yenilenmiş Yarı Saydam & Mikro Animasyonlu Tasarım) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex size-9 items-center justify-center rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <ShoppingBag className="size-4 text-foreground/80 transition-transform duration-300 group-hover:scale-110" />

        {/* Sepet Boş Değilse Üstünde Şık Rozet Belirir */}
        {totalItemsCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[10px] font-black min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow-md ring-2 ring-background animate-in zoom-in-50 duration-200">
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

          <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl border border-border/80 bg-background/95 backdrop-blur-2xl p-5 shadow-2xl z-50 animate-in fade-in-50 slide-in-from-top-2 zoom-in-95 duration-200 space-y-4">
            
            {/* BAŞLIK VE KAPAT BUTONU */}
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
                    Your Cart <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    {totalItemsCount > 0 ? `${totalItemsCount} items ready for checkout` : "Your cart is empty"}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* EKLENEN ÜRÜNLERİN LİSTELENDİĞİ CANLI ALAN */}
            <div className="max-h-64 overflow-y-auto my-1 space-y-2 pr-1 custom-scrollbar">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div 
                    key={item.stripePriceId} 
                    className="p-3 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/40 flex items-center justify-between gap-3 transition-all duration-200"
                  >
                    {/* Ürün Detayları */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <p className="font-semibold text-xs text-foreground truncate leading-snug">
                        {item.name || "Product Item"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                    
                    {/* Tekil Ürün Silme Butonu (Mevcut CheckoutButton modunu kullanır) */}
                    <div className="shrink-0">
                      <CheckoutButton 
                        mode="remove-item" 
                        productInfo={{ stripePriceId: item.stripePriceId, name: item.name || "Product" }} 
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center space-y-2">
                  <div className="mx-auto h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground text-lg">
                    🛒
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Your shopping cart is currently empty.
                  </p>
                </div>
              )}
            </div>

            {/* SEPET YÖNETİM VE BUTON ALANI */}
            {cartItems.length > 0 && (
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-1/3">
                    <CheckoutButton mode="clear-cart" />
                  </div>
                  <div className="w-2/3">
                    <CheckoutButton mode="checkout-cart" />
                  </div>
                </div>
              </div>
            )}

          </div>
        </>
      )}
    </div>
  );
}