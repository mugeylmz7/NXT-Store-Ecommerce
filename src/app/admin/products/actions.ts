"use server";

import { revalidatePath } from "next/cache";
import { deleteMultipleProducts } from "@/lib/products";

export async function bulkDeleteProductsAction(productIds: string[]) {
  try {
    await deleteMultipleProducts(productIds);
    revalidatePath("/admin/products");  // Önbelleği temizle
    revalidatePath("/");                // Anasayfa önbelleğini temizle
    return { success: true };
  } catch (error) {
    console.error("Bulk delete action error:", error);
    return { success: false };
  }
}