import Image from "next/image";
import { Badge } from "../ui/badge";
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
  const priceLabel = formatPrice(
    priceCents,
    currency as Currency,
  );

  // Eğer bir array geldiyse, kartta göstermek için İLK RESMİ seçiyoruz
  // Eğer array boşsa veya tanımsızsa undefined dönerek güvenliğe alıyoruz
  const mainImageUrl = imageUrls && imageUrls.length > 0 ? imageUrls[0] : undefined;

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
          
          {/* Eğer ürün sepetteyse hemen fiyatın altında "Remove" yazısı belirecek */}
          <CheckoutButton 
            mode="remove-item" 
            productInfo={{ stripePriceId: stripePriceId || '', name: name }} 
          />
        </div>
        
        <div className="w-32">
          <CheckoutButton 
            mode="add-to-cart" 
            productInfo={{ stripePriceId: stripePriceId || '', name: name }} 
          />
        </div>
      </CardFooter>
    </Card>
  );
}