"use server";

import { sendOrderCancelledEmail, sendOrderReceivedEmail, sendOrderShippedEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications";

// 1. Siparişi Kargoya Verme
export async function markOrderAsShippedAction(orderId: string) {
  try {
    const db = prisma as any;

    // const updatedOrder değişkenine atıyoruz:
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status: "SHIPPED",
        shippedAt: new Date(),  // Kargolanma tarihi 
      },
    });

    // Kargoya Verildi E-Posta Bildirimi (KORUNDU)
    const targetEmail = (updatedOrder as any)?.userEmail;
    if (targetEmail){
      await sendOrderShippedEmail(targetEmail, (updatedOrder as any).id);

      // ZİL İKONU BİLDİRİMİ (EKLENDİ)
      await createNotification({
        userId: targetEmail,
        title: "Order Shipped! 🚚",
        message: `Your order #${orderId.slice(-6)} has been shipped.`,
        link: "/user/orders",
      });
    }

    revalidatePath("/admin/orders");
    revalidatePath("/user/orders");
    return { success: true };
  } catch (error) {
    console.error("Shipping order error:", error);
    return { success: false, error: "Failed to ship order." };
  }
}


// 2. Siparişi Admin Olarak İptal Etme
export async function adminCancelOrderAction(orderId: string) {
  try {
    const db = prisma as any;

    // const updatedOrder değişkenine atıyoruz:
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelledBy: "ADMIN"    // Admin iptal etti olarak işaretliyoruz
      }
    });

    // Sipariş İptal Edildi E-Posta Bildirimi (KORUNDU)
    const targetEmail = (updatedOrder as any)?.userEmail;
    if (targetEmail){
      await sendOrderCancelledEmail(targetEmail, (updatedOrder as any).id, "ADMIN");

      // ZİL İKONU BİLDİRİMİ (EKLENDİ)
      await createNotification({
        userId: targetEmail,
        title: "Order Cancelled ❌",
        message: `Your order #${orderId.slice(-6)} was cancelled by an admin.`,
        link: "/user/orders",
      });
    }

    revalidatePath("/admin/orders");
    revalidatePath("/user/orders");
    return { success: true };
  } catch (error) {
    console.error("Admin cancel order error:", error);
    return { success: false, error: "Failed to cancel order." };
  }
}


export async function userCancelOrderAction(orderId: string) {
  try {
    const db = prisma as any;

    // 1. Siparişi veritabanında USER tarafından iptal edildi olarak güncelle
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelledBy: "USER",
      },
    });

    // 2. ADMIN İÇİN ZİL İKONUNA BİLDİRİM DÜŞÜR (EKLENEN KISIM)
    await createNotification({
      userId: "ADMIN",
      title: "Order Cancelled by Customer ⚠️",
      message: `Order #${orderId.slice(-6)} was cancelled by user ${updatedOrder.userEmail || ""}.`,
      link: "/admin/orders",
    });

    // 3. İsteğe bağlı E-posta bildirimi (Var olan e-posta fonksiyonun)
    if (updatedOrder.userEmail) {
      await sendOrderCancelledEmail(updatedOrder.userEmail, orderId, "USER");
    }

    revalidatePath("/user/orders");
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("User cancel order error:", error);
    return { success: false, error: "Failed to cancel order." };
  }
}