"use client"; //İstemci tarafında çalışması (onSubmit tetikleyicisi) için şart

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { addToCart, clearCart, getCart, removeFromCart } from "@/lib/cart-store";


interface CheckoutButtonProps {
  // Çoklu sepet için buraya dinamik sepet verisi alabilsin.
  // Eğer prop olarak bir şey geçilmezse, koddaki varsayılan test verilerini kullanır.
  mode: "add-to-cart" | "checkout-cart" | "clear-cart" | "remove-item";
  productInfo?: { stripePriceId: string; name: string };
}

export function CheckoutButton({ mode, productInfo }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isInCart, setIsInCart] = useState(false); // Ürün sepette mi kontrolü için


  const [toast, setToast] = useState({ show: false, msg: "", type: "success" as "success" | "info" | "error" });

  // Özel Toast State'i (Göze hitap eden modern uyarılar için)
  const triggerToast = (msg: string, type: "success" | "info" | "error" = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2500);
  };

  useEffect(() => {
    const updateCartState = () => {
      const cart = getCart();
      setCartCount(cart.reduce((acc, item) => acc + item.quantity, 0));
      // Eğer bu spesifik ürün sepette varsa true yap
      if (productInfo?.stripePriceId) {
        setIsInCart(cart.some(item => item.stripePriceId === productInfo.stripePriceId));
      }
    };

    updateCartState();
    window.addEventListener("cart-updated", updateCartState);
    return () => window.removeEventListener("cart-updated", updateCartState);
  }, [productInfo?.stripePriceId, mode]);

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productInfo?.stripePriceId) {
      triggerToast("Stripe price credentials missing!", "error");
      return;
    }
    addToCart({ stripePriceId: productInfo.stripePriceId, quantity: 1, name: productInfo.name });
    triggerToast(`Added ${productInfo.name} to cart! 👍`, "success");
  };


  // Tekil ürün silme tetikleyicisi
  const handleRemoveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productInfo?.stripePriceId) return;
    removeFromCart(productInfo.stripePriceId);
    triggerToast(`Removed ${productInfo.name} from cart.`, "info");
  };

  // 2. Durum: Sepetteki Tüm Ürünleri Topluca Ödemeye Gönderme Fonksiyonu
  const handleCartCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentCart = getCart();

    if (currentCart.length === 0) {
      triggerToast("Your cart is empty! Please add some items first.", "info");
      return;
    }

    setLoading(true);
    try {
      // Veriyi API'ye JSON formatında güvenle gönderiyoruz
      const response = await fetch('/api/stripe/checkout', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartItems: currentCart }), // Tüm sepet dizisi tek seferde gidiyor
      });

      const data = await response.json();

      if (data.url) {
        clearCart(); // Sepeti temizliyoruz, çünkü kullanıcı ödeme sayfasına yönlendiriliyor
        // Stripe'ın çoklu ürün destekleyen güvenli ödeme sayfasına gönderiyoruz
        window.location.href = data.url;
      } else {
        triggerToast(data.error || "Checkout failed", "error");
      }
    } catch (error) {
      console.error(error);
      triggerToast("Network error occurred.", "error");
    } finally {
      setLoading(false);
    }
  };


  // 3. Durum: Sepeti Tamamen Temizleme Fonksiyonu
  const handleClearCart = (e: React.FormEvent) => {
    e.preventDefault();
    clearCart();
    // Sayfadaki sepet sayısını sıfırlamak için event'i tetikliyoruz
    window.dispatchEvent(new Event("cart-updated"));
    triggerToast("Your cart has been cleared!", "info");
  };


  return (
    <>
      {toast.show && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border border-border/85 px-6 py-4 shadow-2xl min-w-[320px] max-w-md bg-background font-medium text-sm text-foreground transition-all duration-300">
          <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white font-bold text-xs ${toast.type === "success" ? "bg-emerald-500 shadow-md" :
              toast.type === "info" ? "bg-blue-500 shadow-md" :
                "bg-destructive shadow-md"
            }`}>
            {toast.type === "success" ? "✓" : toast.type === "info" ? "i" : "!"}
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold text-sm tracking-tight">
              {toast.type === "success" ? "Success" : toast.type === "info" ? "Notification" : "Error"}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {toast.msg}
            </p>
          </div>
        </div>
      )}

      {/* MOD 1: SEPETE EKLE BUTONU (KART İÇİNDEKİ) */}
      {mode === "add-to-cart" && (
        <form onSubmit={handleAddToCart}>
          <Button
            type="submit"
            variant="outline"
            className="w-full"
          >
            Add to Cart
          </Button>
        </form>
      )}

      {/* Eğer ürün sepetteyse görünecek olan kibar "Remove" butonu */}
      {mode === "remove-item" && isInCart && (
        <form onSubmit={handleRemoveItem}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full border borcer-input text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            Remove
          </Button>
        </form>
      )}

      {/* MOD 2: SEPETİ SIFIRLA BUTONU */}
      {mode === "clear-cart" && (
        <form onSubmit={handleClearCart} className="w-full">
          <Button
            type="submit"
            variant="ghost"
            className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            Reset Cart
          </Button>
        </form>
      )}

      {/* MOD 3: PREMİUM CHECKOUT BUTTON (STRIPE TETİKLEYİCİ) */}
      {mode === "checkout-cart" && (
        <form onSubmit={handleCartCheckout} className="w-full">
          <Button
            type="submit"
            disabled={loading}
            variant="default"
            className="w-full shadow-md shadow-primary/10 rounded-xl active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </div>
            ) : (
              `Pay Total (${cartCount} items)`
            )}
          </Button>
        </form>
      )}
    </>
  );
}