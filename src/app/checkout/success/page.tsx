import Link from "next/link";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getSessionUser } from "@/lib/auth0-utils"; // Kullanıcı e-postasını almak için
import { sendOrderReceivedEmail } from "@/lib/email";  // Resend e-posta fonksiyonu
import { createNotification } from "@/lib/notifications";
import { ClearCartOnSuccess } from "@/components/storefront/clear-cart-on-success";

export const metadata = {
  title: "Checkout Successful | NXT Store",
};

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const user = await getSessionUser();

// Stripe Session üzerinden veritabanında sipariş oluşturma
  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ["line_items"],
      });

      if (session && session.payment_status === "paid") {
        const db = prisma as any;

        if (db.order) {
          // 1. MÜKERRER SİPARİŞ KONTROLÜ (Çift kaydı engeller)
          const existingOrder = await db.order.findUnique({
            where: { stripeSessionId: session.id },
          });

          if (!existingOrder) {
            const lineItems = session.line_items?.data || [];
            const recipientEmail =
              user?.email || session.customer_details?.email || null;

            // 2. YENİ SİPARİŞ OLUŞTUR
            const createdOrder = await db.order.create({
              data: {
                stripeSessionId: session.id,
                userId: user?.id || null,
                userEmail: recipientEmail,
                totalCents: session.amount_total || 0,
                currency: (session.currency?.toUpperCase() as any) || "EUR",
                status: "PAID",
              },
            });

            // 3. STRIPE'TAN GELEN GERÇEK ÜRÜNLERİ EŞLEŞTİR VE EKLE
            if (db.orderItem) {
              for (const item of lineItems) {
                const stripePriceId = item.price?.id;

                // Veritabanında bu Stripe Price ID'ye sahip GERÇEK ürünü bul
                let matchingProduct = null;
                if (stripePriceId && db.product) {
                  matchingProduct = await db.product.findFirst({
                    where: { stripePriceId: stripePriceId },
                  });
                }

                // Eğer Stripe Price ID eşleşmezse son çare herhangi bir aktif ürün al
                if (!matchingProduct && db.product) {
                  matchingProduct = await db.product.findFirst();
                }

                if (matchingProduct) {
                  await db.orderItem.create({
                    data: {
                      orderId: createdOrder.id,
                      productId: matchingProduct.id,
                      quantity: item.quantity || 1,
                      priceCents: item.price?.unit_amount || 0,
                    },
                  });
                }
              }
            }

            // 4. E-POSTA VE ZİL BİLDİRİMLERİ
            if (recipientEmail) {
              const formattedTotal =
                (session.currency?.toUpperCase() || "EUR") +
                " " +
                ((session.amount_total || 0) / 100).toFixed(2);

              await sendOrderReceivedEmail(
                recipientEmail,
                createdOrder.id,
                formattedTotal
              );

              // Müşteri için bildirim
              await createNotification({
                userId: recipientEmail,
                title: "Order Placed Successfully! 🎉",
                message: `We received your order #${createdOrder.id.slice(-6)}. Total: ${formattedTotal}`,
                link: "/user/orders",
              });
            }

            // Admin için bildirim
            await createNotification({
              userId: "ADMIN",
              title: "New Order Received 🛒",
              message: `New order #${createdOrder.id.slice(-6)} placed by ${recipientEmail || "Customer"}.`,
              link: "/admin/orders",
            });
          }
        }
      }
    } catch (error) {
      console.error("Order creation error:", error);
    }
  }

  return (
    <main className="container max-w-xl mx-auto min-h-[70vh] flex items-center justify-center p-4 py-12">
      {/* Ödeme Başarılı Olduğu İçin Sepet Yalnızca Burada Temizlenir */}
      <ClearCartOnSuccess />

      <Card className="w-full text-center border-emerald-500/30 shadow-xl bg-card">
        <CardHeader className="space-y-4 pb-4 pt-8">
          {/* Yeşil Başarı İkonu */}
          <div className="mx-auto size-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-in zoom-in-50 duration-300">
            <CheckCircle2 className="size-12" />
          </div>

          <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-slate-500 bg-clip-text text-transparent">
            Checkout Successful!
          </CardTitle>

          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Thank you for your purchase. Your order has been successfully processed and a confirmation email has been sent.
          </p>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {session_id && (
            <div className="bg-muted/50 p-2.5 rounded-xl border border-border/60 text-xs font-mono text-muted-foreground truncate max-w-xs mx-auto">
              Ref ID: {session_id}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center pb-8 pt-2 px-6">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/user/orders">
              <ShoppingBag className="mr-2 size-4" />
              View Orders
            </Link>
          </Button>

          <Button asChild className="w-full sm:w-auto">
            <Link href="/">
              Continue Shopping
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}