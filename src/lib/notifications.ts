import { prisma } from "@/lib/prisma";

export async function createNotification({
  userId,
  title,
  message,
  link,
}: {
  userId: string; // Adminler için "ADMIN" veya Müşterinin Email/ID bilgisi
  title: string;
  message: string;
  link: string;
}) {
  try {
    const db = prisma as any;
    if (db.notification) {
      await db.notification.create({
        data: {
          userId,
          title,
          message,
          link,
          isRead: false,
        },
      });
    }
  } catch (error) {
    console.error("Create notification error:", error);
  }
}