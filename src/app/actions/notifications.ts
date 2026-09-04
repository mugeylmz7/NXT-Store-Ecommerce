"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser, isAdmin } from "@/lib/auth0-utils";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications";

export async function getNotificationsAction() {
  const user = await getSessionUser();
  if (!user) return [];

  const userIsAdmin = isAdmin(user);
  const db = prisma as any;

  try {
    if (!db.notification) return [];

    return await db.notification.findMany({
      where: {
        OR: [
          { userId: user.email },
          { userId: user.sub },
          ...(userIsAdmin ? [{ userId: "ADMIN" }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return [];
  }
}

export async function markNotificationAsReadAction(id: string) {
  try {
    const db = prisma as any;
    if (db.notification) {
      await db.notification.update({
        where: { id },
        data: { isRead: true },
      });
    }
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteNotificationAction(id: string) {
  try {
    const db = prisma as any;
    if (db.notification) {
      await db.notification.delete({
        where: { id },
      });
    }
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}


// YENİ EKLENEN SADECE BU FONKSİYON (Checkout sırasında askı bildirimi oluşturur):
export async function sendSuspendedNotificationAction() {
  try {
    const user = await getSessionUser();
    if (!user?.email) return { success: false };

    await createNotification({
      userId: user.email,
      title: "Account Suspended ⚠️",
      message: "Your purchase attempt was blocked because your account is suspended. Click to contact support.",
      link: "/support",
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Send suspended notification error:", error);
    return { success: false };
  }
}