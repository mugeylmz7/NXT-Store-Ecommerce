"use server";

import { ProductCategory } from "@/types/product";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateProduct } from "@/lib/products";
import { uploadProductImagesService } from "@/services/imageService";

export async function handleEditAction(formData: FormData) {
  "use server";

  const productId = formData.get("productId") as string;
  const currentImageUrls = formData.getAll("currentImageUrls") as string[];

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const priceCents = parseInt(formData.get("priceCents") as string) || 0;
  const stock = parseInt(formData.get("stock") as string) || 0;
  
  const rawCategory = formData.get("category") as string;
  const category = rawCategory as ProductCategory;

  const isActive = formData.get("isActive") === "true";
  const imageFiles = formData.getAll("images") as File[];

  // Silinmek istenen resimleri filtreleme
  const removeImages = formData.getAll("removeImages") as string[];
  let finalImageUrls = [...currentImageUrls].filter(url => !removeImages.includes(url));

  const newUploadedImageUrls = await uploadProductImagesService(imageFiles);
  if (newUploadedImageUrls.length > 0) {
    finalImageUrls = [...finalImageUrls, ...newUploadedImageUrls];
  }

  try {
    await updateProduct(productId, {
      name,
      description,
      priceCents,
      stock,
      category,
      isActive,
      imageUrls: finalImageUrls,
    });
  } catch (error) {
    console.error("Update error:", error);
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}
