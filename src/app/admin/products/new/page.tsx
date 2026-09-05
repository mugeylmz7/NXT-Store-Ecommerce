import type { Metadata } from "next";

import { CreateProductForm } from "./create-product-form";
import { CreateProductSuccess } from "./create-product-success";

export const metadata: Metadata = {
  title: "Create product | Admin",
  description: "Add a new product to the store",
};

type NewProductPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewProductPage({ searchParams }: NewProductPageProps) {
  const resolvedSearchParams = await searchParams;
  const createdParam = resolvedSearchParams.created;
  const createdProductId = Array.isArray(createdParam)
    ? createdParam[0]
    : createdParam;

  return (
    <main className="container max-w-5xl mx-auto space-y-6 p-6 pb-8">
      <div className="space-y-1">
        <h1 className=" font-bold tracking-tight text-foreground">
          Create product
        </h1>
        <p className="text-sm text-muted-foreground">
          Save product data with Prisma + MongoDB and upload images to Vercel Blob.
        </p>
      </div>

      {createdProductId ? (
        <CreateProductSuccess productId={createdProductId} />
      ) : (
        <CreateProductForm />
      )}
    </main>
  );
}