import Link from "next/link";
import { notFound} from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getProductById } from "@/lib/products";
import { ProductCategory } from "@/types/product";
import { handleEditAction } from "./actions";
import { Typography } from "@/components/ui/typography";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: EditProductPageProps) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  // Veritabanındaki kategorinin selectbox'ta doğru seçili gelmesi için küçük harfe zorluyoruz
  const currentCategory = product.category ? product.category.toLowerCase() : "electronics";

  return (
    <main className="space-y-6 p-6 max-w-2xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Edit Product</h1>
        <Typography variant="body" className="text-sm text-muted-foreground">
          Modify the details of {product.name}
        </Typography>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>Update your product details and manage assets safely.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleEditAction} encType="multipart/form-data" className="space-y-4">

          <input type="hidden" name="productId" value={productId} />
            {product.imageUrls?.map((url, i) => (
              <input key={i} type="hidden" name="currentImageUrls" value={url} />
            ))}

            <div className="space-y-2">
              <label className="text-sm font-medium">Product Name</label>
              <Input name="name" defaultValue={product.name} required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea name="description" defaultValue={product.description} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (in Cents)</label>
                <Input name="priceCents" type="number" defaultValue={product.priceCents} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock Quantity</label>
                <Input name="stock" type="number" defaultValue={product.stock} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                {/* Option value değerlerini hem küçük hem büyük ihtimalini kapsayacak şekilde güncelledik */}
                <select 
                  name="category" 
                  defaultValue={product.category}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value={ProductCategory.ELECTRONICS}>Electronics</option>
                  <option value={ProductCategory.CLOTHING}>Clothing</option>
                  <option value={ProductCategory.HOME}>Home</option>
                  <option value={ProductCategory.SPORTS}>Sports</option>
                  <option value={ProductCategory.OTHER}>Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  name="isActive"
                  defaultValue={product.isActive ? "true" : "false"}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <label className="text-sm font-medium block">Upload New Images (Optional)</label>
              <Input name="images" type="file" multiple accept="image/*" />
            </div>

            {product.imageUrls && product.imageUrls.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium block">Current Images ({product.imageUrls.length})</label>
                <div className="flex gap-2 overflow-x-auto p-2 bg-muted/50 rounded-lg">
                  {product.imageUrls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 border p-2 rounded bg-background">
                      <img 
                        src={url} 
                        alt="product" 
                        className="w-12 h-12 object-cover rounded border"
                      />
                      <label className="flex items-center gap-1.5 text-xs text-destructive cursor-pointer select-none">
                        <input
                          type="checkbox"
                          name="removeImages"
                          value={url}
                          className="rounded border-gray-300 text-destructive focus:ring-destructive"
                        />
                        Remove
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/products">Cancel</Link>
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}