import Link from "next/link";
import { AdminProductsTable } from "@/components/admin/admin-products-table";
import { Button } from "@/components/ui/button";
import { getAllProducts } from "@/lib/products";

export const metadata = {
  title: "Products",
};

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-foreground">
            Products
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage catalog items, pricing, and availability.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">Create product</Link>
        </Button>
      </div>

      <AdminProductsTable products={products} />
    </main>
  );
}