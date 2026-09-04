"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function cancelOrderAction(orderId: string) {
  try {
    const db = prisma as any;

    if (!db.order) {
      return { success: false, error: "Database client error." };
    }

    // 1. Siparişi bul
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { success: false, error: "Order not found." };
    }

    // 2. Kargo kontrolü: Kargoya verildiyse kullanıcı iptal edemez
    if (order.status === "SHIPPED" || order.status === "DELIVERED") {
      return {
        success: false,
        error: "Shipped or delivered orders cannot be cancelled.",
      };
    }

    // 3. İptal işlemini gerçekleştir
    await db.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        cancelledBy: "USER",
        cancelledAt: new Date(),
      },
    });

    // Sayfayı anında yenile ki yeni durum ekrana yansısın
    revalidatePath("/user/orders");

    return { success: true };
  } catch (error: any) {
    console.error("Cancel order error:", error);
    return { success: false, error: "Failed to cancel order." };
  }
}