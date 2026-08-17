import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { deleteProduct } from "@/lib/products"; // Silme/arşivleme fonksiyonunu içeri aktarıyoruz

type DeleteProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DeleteProductPage({
  params,
}: DeleteProductPageProps) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  // `getProductById` yerine doğrudan ham Prisma sorgusu atıyoruz
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    notFound();
  }

  const urlsToDelete = product.imageUrls ? [...product.imageUrls] : [];

  async function handleDeleteAction() {
    "use server";

    try {
      // Hem Stripe'ı arşivleyen hem de MongoDB'den silen fonksiyonumuzu çağırıyoruz
      await deleteProduct(productId);

      // 2. Vercel Blob resimlerini temizle
      if (urlsToDelete.length > 0) {
        await del(urlsToDelete);
      }
    } catch (error) {
      console.error("Deleting is failed", error);
    }

    revalidatePath("/admin/products");
    revalidatePath("/");
    redirect("/admin/products");
  }

  return (
    <main className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Delete product
        </h1>
        <p className="text-sm text-muted-foreground">{product.name}</p>
      </div>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Confirm deletion</CardTitle>
          <CardDescription>
            Are you sure you want to delete <strong>{product.name}</strong>? This action will permanently remove it from MongoDB and Vercel Blob storage.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <form action={handleDeleteAction}>
            <Button type="submit" variant="destructive">
              Delete product
            </Button>
          </form>
          <Button asChild variant="outline">
            <Link href="/admin/products">Cancel</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}