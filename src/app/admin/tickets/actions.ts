"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleTicketStatusAction(ticketId: string, newStatus: string) {
  try {
    const db = prisma as any;

    if (db.supportTicket) {
      await db.supportTicket.update({
        where: { id: ticketId },
        data: { status: newStatus },
      });
    }

    revalidatePath("/admin/tickets");
    return { success: true };
  } catch (error) {
    console.error("Update ticket status error:", error);
    return { success: false, error: "Failed to update ticket status." };
  }
}


export async function deleteTicketAction(ticketId: string) {
  try {
    const db = prisma as any;

    if (db.supportTicket) {
      await db.supportTicket.delete({
        where: { id: ticketId },
      });
    }

    revalidatePath("/admin/tickets");
    return { success: true };
  } catch (error) {
    console.error("Delete ticket error:", error);
    return { success: false, error: "Failed to delete ticket." };
  }
}