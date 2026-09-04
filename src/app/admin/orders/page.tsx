import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Currency } from "@/generated/prisma";
import { formatPrice } from "@/types/currency";
import { error } from "console";
import { adminCancelOrderAction, markOrderAsShippedAction } from "./actions";
import { CheckCircle2, Truck, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Manage Orders | Admin Dashboard",
};

export default async function AdminOrdersPage() {
  const db = await prisma as any;
  let orders: any[] = [];

  try {
    if (db.order) {
      orders = await db.order.findMany({
        include: {
          items: {
            include: { product: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }
  } catch (err) {
    console.error("Admin orders fetch error:", err);
  }


  return (
    <main className="w-full space-y-6 px-3 py-6 sm:px-6 sm:py-10">
      <div className="space-y-1">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground leading-snug">
          Admin Order Management
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Manage customer orders, update shipping statuses, or handle cancellations.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order: any) => {
          const isShipped = order.status === "SHIPPED";
          const isCancelled = order.status === "CANCELLED";


          return (
            <Card key={order.id} className="overflow-hidden border-border/80">
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">ID: {order.id}</span>
                      <Badge variant={isCancelled ? "destructive" : isShipped ? "default" : "secondary"}>
                        {order.status || "PENDING"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground pt-1">
                      Date: {new Date(order.createdAt).toLocaleDateString("en-US")}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-bold">
                      {formatPrice(order.totalCents || 0, (order.currency as any) || "EUR")}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                {/* Sipariş Edilen Ürünler */}
                <div className="space-y-2">
                  {(order.items || []).map((item: any) => (
                    <div key={item.id} className="text-sm flex justify-between border-b pb-2 last:border-0">
                      <span>{item.product?.name || "Product"} (x{item.quantity})</span>
                      <span className="font-medium">{formatPrice((item.priceCents || 0) * item.quantity, (order.currency as any) || "EUR")}</span>
                    </div>
                  ))}
                </div>

                {/* ADMİN AKSİYON BUTONLARI */}
                <div className="flex flex-wrap gap-2 justify-end pt-3 border-t">
                  {!isShipped && !isCancelled && (
                    <>
                      {/* Kargoya Ver Butonu */}
                      <form action={async () => {
                        "use server";
                        await markOrderAsShippedAction(order.id);
                      }}>
                        <Button variant="default" size="sm">
                          <Truck className="size-3.5 mr-1" /> Mark as Shipped
                        </Button>
                      </form>

                      {/* Admin İptal Et Butonu */}
                      <form action={async () => {
                        "use server";
                        await adminCancelOrderAction(order.id);
                      }}>
                        <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs">
                          <XCircle className="size-3.5 mr-1" /> Admin Cancel
                        </Button>
                      </form>
                    </>
                  )}

                  {isShipped && (
                    <span className="text-xs font-medium flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" /> Order has been shipped
                    </span>
                  )}

                  {isCancelled && (
                    <span className="text-xs text-destructive font-medium flex items-center gap-1">
                      <XCircle className="size-3.5" />Cancelled ({order.cancelledBy || "USER"})
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}