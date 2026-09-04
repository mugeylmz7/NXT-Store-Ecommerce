import Link from "next/link";
import Image from "next/image";
import { Package, ShoppingBag, Calendar, CreditCard, XCircle, Truck, AlertCircle, Headphones } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getAdmin, getSessionUser } from "@/lib/auth0-utils"; // Kullanıcı bilgisi için
import { Currency, formatPrice } from "@/types/currency";
import { CancelOrderButton } from "./cancel-orders-button";
import { redirect } from "next/navigation";

export const metadata = {
  title: "My Orders | NXT Store",
};

export default async function UserOrdersPage() {
  const user = await getSessionUser();
  const admin = await getAdmin(); // 1. EKSİK OLAN SATIR EKLENDİ

  // 2. ADMIN YÖNLENDİRMESİ
  if (admin) {
    redirect("/admin/orders");
  }

  const db = prisma as any;
  let orders: any[] = [];

try {
    if (db.order && user) {
      orders = await db.order.findMany({
        where: {
          OR: [
            { userId: user.id },
            { userEmail: user.email },
          ],
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }
  } catch (error) {
    console.error("Orders fetch error:", error);
  }

  if (!orders || orders.length === 0) {
    return (
      <main className="container max-w-4xl mx-auto min-h-[65vh] flex items-center justify-center p-6">
        <Card className="w-full text-center border-dashed p-8">
          <CardHeader className="space-y-3">
            <div className="mx-auto size-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Package className="size-8" />
            </div>
            <CardTitle className="text-2xl font-bold">No orders yet</CardTitle>
            <CardDescription>
              You haven't placed any orders with us yet. Start shopping to fill your history!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/">
                <ShoppingBag className="mr-2 size-4" />
                Browse Products
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container max-w-4xl mx-auto space-y-6 px-4 py-3 sm:px-6 sm:py-6 pb-6 md:pb-84 md:py-2 lg:pb-12">
      <div className="space-y-1">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
          My Orders
        </h1>
        <p className="text-sm text-muted-foreground">
          View and track your previous purchases.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order: any) => {
          // Sipariş Durumu Kontrolleri
          const isCancelled = order.status === "CANCELLED";
          const isShipped = order.status === "SHIPPED";

          // Kargolanmadıysa ve İptal Edilmediyse İptal Edilebilir kabul ediyoruz
          const canCancel = !isShipped && !isCancelled;
          const isCancelledByAdmin = isCancelled && order.cancelledBy === "ADMIN";

        return (
            <Card key={order.id} className="overflow-hidden border-border/80 shadow-sm">
              <CardHeader className="bg-muted/30 border-b border-border/50 p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        Order ID: {order.id}
                      </span>

                      {isCancelled ? (
                        <Badge variant="destructive" className="flex items-center gap-1 py-3">
                          <XCircle className="size-3" /> Cancelled
                        </Badge>
                      ) : isShipped ? (
                        <Badge className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1 py-3">
                          <Truck className="size-3" /> Shipped
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-chart-2 text-foreground dark:bg-primary dark:text-secondary-foreground py-3 flex items-center gap-1">
                          Order Received
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-2">
                        <Calendar className="size-3.5" />
                        Ordered: {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>

                      {order.shippedAt && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-medium">
                          <Truck className="size-3.5 " />
                          Shipped: {new Date(order.shippedAt).toLocaleDateString("en-US")}
                        </span>
                      )}

                      {order.cancelledAt && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-destructive text-muted dark:bg-destructive dark:text-destructive-foreground font-medium">
                          <XCircle className="size-3.5" />
                          Cancelled: {new Date(order.cancelledAt).toLocaleDateString("en-US")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:text-right">
                    <CreditCard className="size-4 text-muted-foreground hidden sm:inline" />
                    <span className="text-base font-bold text-foreground">
                      {formatPrice(order.totalCents || 0, (order.currency as Currency) || "EUR")}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                <div className="space-y-3">
                  {(order.items || []).map((item: any) => (
                    <div
                      key={item.id || Math.random()}
                      className="flex items-center justify-between gap-4 pb-2 border-b last:border-0 border-border/30"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative size-15 rounded-lg bg-muted overflow-hidden shrink-0">
                          {item.product?.imageUrls?.[0] ? (
                            <Image
                              src={item.product.imageUrls[0]}
                              alt={item.product?.name || "Product"}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.product?.name || "Purchased Product"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity} × {formatPrice(item.priceCents || 0, (order.currency as Currency) || "EUR")}
                          </p>
                        </div>
                      </div>

                      <span className="text-sm font-semibold text-foreground shrink-0">
                        {formatPrice((item.priceCents || 0) * (item.quantity || 1), (order.currency as Currency) || "EUR")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ADMIN TARAFINDAN İPTAL UYARISI */}
                {isCancelledByAdmin && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3.5 flex items-start gap-3 text-amber-900 dark:text-amber-200 text-xs mt-2">
                    <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold">This order was cancelled by the seller / administrator.</p>
                      <p className="text-muted-foreground">
                        If you have questions regarding refunds or cancellation reasons, please contact support.
                      </p>
                      <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs text-amber-700 dark:text-amber-300 underline mt-1">
                        <Link href="/support">
                        <Headphones className="size-3 mr-1 inline" /> Contact Support
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}

                {/* İPTAL ET BUTONU */}
                {canCancel && (
                  <div className="flex justify-end pt-2 border-t border-border/40">
                    <CancelOrderButton orderId={order.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}