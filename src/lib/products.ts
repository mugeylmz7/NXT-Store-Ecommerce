import type { Product as PrismaProduct } from "@/generated/prisma";

import { parseStorefrontFiltersFromSearchParams } from "@/lib/validation";
import type { CreateProductData } from "@/lib/validation/product";
import { prisma } from "@/lib/prisma";
import { Currency, isCurrency } from "@/types/currency";
import {
  isProductCategory,
  type ProductCategory,
  type ProductSort,
} from "@/types/product";

export type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: Currency;
  category: ProductCategory;
  stock: number;
  imageUrls: string[];
  isActive: boolean;
  stripeProductId?: string | null; // Stripe Ürün ID alanı eklendi
  stripePriceId?: string | null;   // Stripe Fiyat ID alanı eklendi
  createdAt: Date;
  updatedAt: Date;
};

export type GetStorefrontProductsFilters = {
  category?: ProductCategory | "all";
  sort?: ProductSort;
};

function toProduct(record: PrismaProduct): Product {
  if (!isCurrency(record.currency)) {
    throw new Error(`Unsupported currency: ${record.currency}`);
  }
  if (!isProductCategory(record.category)) {
    throw new Error(`Unsupported category: ${record.category}`);
  }


  // record içerisinden gelen stripe alanlarını güvenle eşleştiriyoruz.
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    priceCents: record.priceCents,
    currency: record.currency,
    category: record.category,
    stock: record.stock,
    imageUrls: record.imageUrls,
    isActive: record.isActive,
    stripeProductId: (record as any).stripeProductId ?? null, 
    stripePriceId: (record as any).stripePriceId ?? null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function getStorefrontProducts(
  _filters: GetStorefrontProductsFilters = {},
): Promise<Product[]> {
  try {
    const records = await prisma.product.findMany({
      where: {
        isActive: true, // Anasayfada sadece aktif ürünleri göstermek için filtreleme
      },
      orderBy: { createdAt: "desc" },
    });
    return records.map(toProduct);
  } catch (error) {
    console.error("An error occured when fetching all products from DB", error);
    return [];
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    // There were 2 problems:
    // 1. enum in prisma has EUR, USD, TRY and we have EUR, GBP, TRY in our code
    // 2. we need to check that the currency and category values are compatible with our TS enums so toProduct() function does that
    const records = await prisma.product.findMany({
      orderBy: { createdAt: "desc" }, // en son eklenen ürünler en üstte olacak şekilde sıralama
    });
    // The line below is the same as
    // return records.map((record) => toProduct(record));
    return records.map(toProduct);
  } catch (error) {
    console.error("An error occured when fetching all products from DB", error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const record = await prisma.product.findUnique({
      where: { id },
    });
    if (!record) return null;
    return toProduct(record);
  } catch (error) {
    console.error(`Error fetching product by id ${id}:`, error);
    return null;
  }
}


// createProduct fonksiyonunu dışarıdan gelen Stripe ID'lerini kabul edecek şekilde genişlettik
export async function createProduct(
  data: CreateProductData & { stripeProductId?: string | null; stripePriceId?: string | null },
  imageUrls: string[],
): Promise<Product> {
  const record = await prisma.product.create({
    data: {
      ...data,
      currency: data.currency as Currency,
      category: data.category as ProductCategory,
      imageUrls,
    },
  });
  return toProduct(record);
}

// Eksik olan Güncelleme fonksiyonunu buraya ekliyoruz
export async function updateProduct(
  id: string,
  data: Partial<CreateProductData> & { imageUrls?: string[]; isActive?: boolean }
): Promise<Product> {

  const { currency, category, ...rest } = data;
  const record = await prisma.product.update({
    where: { id },
    data: {
      ...rest,
      ...(currency && { currency: currency as Currency }),
      ...(category && { category: category as ProductCategory }),
    },
  });
  return toProduct(record);
}

export function parseStorefrontFilters(
  searchParams: Record<string, string | string[] | undefined>,
): { categoryValue: ProductCategory | "all"; sortValue: ProductSort } {
  const { category, sort } =
    parseStorefrontFiltersFromSearchParams(searchParams);

  return { 
  categoryValue: category as ProductCategory | "all", 
  sortValue: sort as ProductSort 
};
}

// Ürün MongoDB'den silinmeden hemen önce Stripe tarafında arşivleniyor (active: false)
import { stripe } from "@/lib/stripe";


// delete products
export async function deleteProduct(id: string): Promise<void> {
  try {
    // Ürünü Stripe üzerinde arşivliyoruz (active: false)
    const product = await prisma.product.findUnique({ 
      where: { id } 
    });
    
    if (product) {
      // Stripe Fiyatını arşivle
      if (product.stripePriceId) {
        await stripe.prices.update(product.stripePriceId, { active: false }).catch(() => null);;
      }
      // Stripe Ürününü arşivle
      if (product.stripeProductId) {
        await stripe.products.update(product.stripeProductId, { active: false }).catch(() => null);;
      }
    }
  } catch (stripeError) {
    console.error(`Stripe archiving failed with id ${id}, moving on to DB deletion:`, stripeError);
  }

  // Yerel veritabanından kalıcı olarak sil
  await prisma.product.delete({
    where: { id },
  });
}