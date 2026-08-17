import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ClearCartOnSuccess } from "@/components/storefront/clear-cart-on-success";

// searchParams parametresine Next.js 15+ standartlarına uygun tip tanımı ekledik:
export default async function CheckoutSuccessPage({ searchParams}: { searchParams: Promise<{ session_id: string }> }) {
   const { session_id } = await searchParams

  return (
    <main className="flex min-h-[75vh] flex-col items-center justify-center p-6 text-center">
      {/* Sayfa yüklendiğinde sepeti otomatik sıfırlayacak istemci bileşeni */}
      <ClearCartOnSuccess />

      <div className="max-w-md space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-primary to-slate-500 bg-clip-text text-transparent">
          Checkout Successful!
        </h1>
        <p className="text-lg text-muted-foreground">
          Thank you for your purchase. Your order has been successfully processed.
        </p>
        <div className="pt-2">
          <Button variant="outline" asChild className="-ml-4 text-muted-foreground hover:text-foreground">
            <Link href="/">← Back to Home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}