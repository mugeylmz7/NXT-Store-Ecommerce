"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Currency, formatPrice } from "../../types/currency";
import {
  formatCategoryLabel,
  type ProductCategory,
} from "../../types/product";
import { CheckoutButton } from "./checkout-button";
import { checkUserSuspendedAction } from "@/app/actions/user";
import { getCart, removeFromCart } from "@/lib/cart-store"; // getCart ve removeFromCart eklendi

type ProductCardProps = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  category: ProductCategory;
  imageUrls?: string[];
  stripePriceId?: string; // Her ürün için Stripe Price ID'si ekledik
};

export function ProductCard({
  id,
  name,
  description,
  priceCents,
  currency,
  category,
  imageUrls,
  stripePriceId,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(0);
  const checkoutBtnRef = useRef<HTMLDivElement>(null);

  const priceLabel = formatPrice(
    priceCents,
    currency as Currency,
  );

  // Eğer bir array geldiyse, kartta göstermek için İLK RESMİ seçiyoruz
  // Eğer array boşsa veya tanımsızsa undefined dönerek güvenliğe alıyoruz
  const mainImageUrl = imageUrls && imageUrls.length > 0 ? imageUrls[0] : undefined;

  // 🌟 KRİTİK DÜZELTME: KARTTAKİ SAYIYI GERÇEK SEPET DURUMUYLA SENKRONİZE ET
  useEffect(() => {
    const syncQuantityWithCart = () => {
      const cart = getCart();
      const currentItem = cart.find((item) => item.stripePriceId === stripePriceId);
      // Eğer ürün sepette varsa onun miktarını al, yoksa 0 yap
      setQuantity(currentItem ? currentItem.quantity : 0);
    };

    // İlk açılışta senkronize et
    syncQuantityWithCart();

    // Sepette her değişiklik olduğunda (silme, sıfırlama, artırma) karttaki sayıyı güncelle
    window.addEventListener("cart-updated", syncQuantityWithCart);
    return () => window.removeEventListener("cart-updated", syncQuantityWithCart);
  }, [stripePriceId]);

  // Sepete Ekleme ve Bildirim Tetikleme
  const triggerCartAdd = () => {
    if (checkoutBtnRef.current) {
      const button = checkoutBtnRef.current.querySelector("button");
      if (button) {
        button.click();
      }
    }
  };

  const handleIncrement = async () => {
    // 1. Önce oturum kontrolü yapıyoruz
    const isSuspended = await checkUserSuspendedAction();

    // 2. Eğer kullanıcı giriş YAPMAMIŞSA (isSuspended === null)
    if (isSuspended === null) {
      // Miktarı ARTIRMIYORUZ!
      // Doğrudan gizli butonu tetikleyerek bildirim ve login yönlendirmesini çalıştırıyoruz
      triggerCartAdd();
      return;
    }

    // 3. Giriş yapmışsa normal şekilde miktarı artırıp sepete ekliyoruz
    setQuantity((prev) => prev + 1);
    triggerCartAdd(); // Gerçek sepete ekler ve bildirimi çıkarır
  };

  const handleDecrement = () => {
    setQuantity((prev) => {
      if (prev > 0) {
        return prev - 1;
      }
      return 0;
    });
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative w-full h-64 overflow-hidden bg-white rounded-t-lg p-2">
        {mainImageUrl ? (
          <Image
            src={mainImageUrl}
            alt={name}
            fill
            // En kritik değişim: Tailwind yerine doğrudan Next.js'in resmi stil prop'unu verdik
            style={{ objectFit: "contain", objectPosition: "center" }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
      </div>

      {/* Gizli CheckoutButton (Sepet ve Bildirim Mekanizması İçin Arka Planda Çalışır) */}
      <div ref={checkoutBtnRef} className="hidden">
        <CheckoutButton
          mode="add-to-cart"
          productInfo={{ stripePriceId: stripePriceId || '', name: name }}
        />
      </div>

      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1 text-base">{name}</CardTitle>
          <Badge variant="secondary">{formatCategoryLabel(category)}</Badge>
        </div>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardFooter className="border-t border-border pt-4 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <p className="text-lg font-semibold text-foreground">{priceLabel}</p>
        </div>

        {/* Miktar Arttırma / Azaltma Butonları */}
        <div className="flex items-center gap-1.5 bg-muted/80 p-1 rounded-lg border border-border/60">
          <Button
            size="icon"
            variant="default"
            className="size-7 rounded-md"
            onClick={handleDecrement}
            disabled={quantity === 0}
          >
            <Minus className="size-3.5" />
          </Button>

          <span className="w-6 text-center text-xs font-bold text-foreground select-none">
            {quantity}
          </span>

          <Button
            size="icon"
            variant="default"
            className="size-7 rounded-md"
            onClick={handleIncrement}
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}