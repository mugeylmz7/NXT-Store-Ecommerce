import { ProductCard } from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getStorefrontProducts } from "@/lib/products";
import type { ProductCategory, ProductSort } from "@/types/product";
import { CheckoutButton } from "./checkout-button";


type ProductGridProps = {
  category: ProductCategory | "all";
  sort: ProductSort;
};

export async function ProductGrid({ category, sort }: ProductGridProps) {
  const products = await getStorefrontProducts({
    category: category === "all" ? "all" : category,
    sort,
  });

  if (products.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
        <p className="text-sm font-medium text-foreground">No products available yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {category === "all" ? "Check back soon — new items will appear here." : "No products in this category."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      
      {/* PREMIUM VE MİNİMALİST SEPET YÖNETİM ALANI */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card/40 p-5 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <h3 className="text-base font-semibold tracking-tight text-foreground">Your Shopping Session</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Collect items from the catalog below and execute a secure multi-item checkout seamlessly.
          </p>
        </div>
        
        {/* Butonların Premium ve Kompakt Dizilimi */}
        <div className="flex items-center gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-border/40">
          <div className="w-1/3 sm:w-28">
            <CheckoutButton mode="clear-cart" />
          </div>
          <div className="w-2/3 sm:w-48">
            <CheckoutButton mode="checkout-cart" />
          </div>
        </div>
      </div>

      {/* Ürün Listesi */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            description={product.description}
            priceCents={product.priceCents}
            currency={product.currency}
            category={product.category as ProductCategory}
            imageUrls={product.imageUrls}
            stripePriceId={product.stripePriceId || undefined}
          />
        ))}
      </div>
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border border-border bg-card">
          <Skeleton className="aspect-4/3 w-full rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}