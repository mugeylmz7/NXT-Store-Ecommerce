"use server";

import { getSessionUser } from "@/lib/auth0-utils";
import { prisma } from "@/lib/prisma";

export async function checkUserSuspendedAction() {
  try {
    const user = await getSessionUser();
    if (!user?.email) return null; // Kullanıcı oturumu yoksa null döndür

    const db = prisma as any;
    if (db.user) {
      const dbUser = await db.user.findUnique({
        where: { email: user.email },
      });
      return dbUser?.isSuspended || false;
    }
    return false;
  } catch (error) {
    console.error("Check suspended status error:", error);
    return false;
  }
}