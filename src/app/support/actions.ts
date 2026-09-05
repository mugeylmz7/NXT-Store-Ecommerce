"use server";

import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { revalidatePath } from "next/cache";

export async function submitSupportTicketAction(formData: {
  orderId?: string;
  subject: string;
  message: string;
}) {
  try {
    const db = prisma as any;

    if (db.supportTicket) {
      // 1. Destek talebini MongoDB'ye kaydediyoruz
      await db.supportTicket.create({
        data: {
          orderId: formData.orderId || null,
          subject: formData.subject,
          message: formData.message,
        },
      });

      // 2. BİLDİRİM TETİKLEYİCİSİ (Zil İkonunda Görünmesi İçin Admin'e Düşer)
      await createNotification({
        userId: "ADMIN",
        title: "New Support Ticket",
        message: `Subject: ${formData.subject}`,
        link: "/admin/tickets",
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Support ticket DB creation error:", error);
    return { success: false, error: "Failed to send message. Please try again." };
  }
}