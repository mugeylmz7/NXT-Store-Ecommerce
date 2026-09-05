"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications";
import { requireAdmin } from "@/lib/auth0-utils";

// Kullanıcıyı askıya alma veya askıdan çıkarma
export async function toggleUserSuspensionAction(userId: string, suspend: boolean) {
  
  try {
    // Admin güvenlik kontrolü
    await requireAdmin();

    const db = prisma as any;

    if (!db.user) {
      return { success: false, error: "User model not found." };
    }

    // Eğer suspend parametresi açıkça gönderilmediyse mevcut durumun tersini alıyoruz
    let nextSuspendState = suspend;
    if (nextSuspendState === undefined) {
      const currentUser = await db.user.findUnique({
        where: { id: userId },
        select: { isSuspended: true },
      });
      nextSuspendState = !currentUser?.isSuspended;
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        isSuspended: suspend,
      },
    });

    // Kullanıcı askıya alındığında / kaldırıldığında bildirim gönderilebilir
    if (updatedUser?.email) {
      await createNotification({
        userId: updatedUser.email,
        title: suspend ? "Account Suspended" : "Account Reactivated",
        message: suspend
          ? "Your account has been suspended by an administrator."
          : "Your account suspension has been lifted.",
        link: "/support", // Kullanıcıyı destek sayfasına yönlendirebilirsiniz
      });
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Toggle user suspension error:", error);
    return { success: false, error: "Failed to update user status." };
  }
}