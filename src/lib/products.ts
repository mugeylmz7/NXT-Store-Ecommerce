import type { Product as PrismaProduct } from "../generated/prisma";
import { parseStorefrontFiltersFromSearchParams } from "@/lib/validation";
import type { CreateProductData } from "@/lib/validation/product";
import { prisma } from "@/lib/prisma";
import { Currency, isCurrency } from "@/types/currency";
import { requireAdmin } from "@/lib/auth0";
import { stripe } from "@/lib/stripe";
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
  // Kategori değerini güvenli şekilde büyük harfe çevirip eşliyoruz
  const rawCategory = typeof record.category === "string" ? record.category.toUpperCase() : "OTHER";
  const category = isProductCategory(rawCategory) ? (rawCategory as ProductCategory) : ("OTHER" as ProductCategory);

  // Para birimini güvenli eşliyoruz
  const rawCurrency = typeof record.currency === "string" ? record.currency.toUpperCase() : "USD";
  const currency = isCurrency(rawCurrency) ? (rawCurrency as Currency) : ("USD" as Currency);

  return {
    id: record.id,
    name: record.name,
    description: record.description,
    priceCents: record.priceCents,
    currency: currency,
    category: category,
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
  filters: GetStorefrontProductsFilters = {}
): Promise<Product[]> {
  try {
    const { category, sort } = filters;

    // 1. Temel Filtre
    const whereClause: any = {
      isActive: true,
    };

    // 2. Kategori Filtresi (Doğrudan Atama)
    if (category && category !== "all") {
      whereClause.category = String(category).toUpperCase();
    }

    // 3. Sıralama Mantığı
    let orderBy: any = { createdAt: "desc" };

    if (sort) {
      const sortVal = String(sort).toLowerCase();
      if (sortVal === "price_asc") orderBy = { priceCents: "asc" };
      else if (sortVal === "price_desc") orderBy = { priceCents: "desc" };
      else if (sortVal === "name_asc") orderBy = { name: "asc" };
      else if (sortVal === "name_desc") orderBy = { name: "desc" };
    }

    const records = await prisma.product.findMany({
      where: whereClause,
      orderBy: orderBy,
    });

    // Eğer büyük harf ile veri gelmediyse ve sonuç boşsa, küçük harfli halini dene
    if (records.length === 0 && category && category !== "all") {
      const fallbackRecords = await prisma.product.findMany({
        where: {
          isActive: true,
          category: String(category).toLowerCase() as any,
        },
        orderBy: orderBy,
      });
      return fallbackRecords.map(toProduct);
    }

    return records.map(toProduct);
  } catch (error) {
    console.error("An error occurred when fetching storefront products:", error);
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
  await requireAdmin();

  const record = await prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      priceCents: data.priceCents,
      currency: data.currency,
      category: data.category,
      stock: data.stock,
      imageUrls,
      stripeProductId: data.stripeProductId ?? null,
      stripePriceId: data.stripePriceId ?? null,
    } as any, // Prisma schema ile çakışmayı önlemek için güvenli tip zorlaması
  });
  return toProduct(record);
}

// Eksik olan Güncelleme fonksiyonunu buraya ekliyoruz
export async function updateProduct(
  id: string,
  data: Partial<CreateProductData> & { imageUrls?: string[]; isActive?: boolean; stripeProductId?: string | null;
    stripePriceId?: string | null; }
): Promise<Product> {
  await requireAdmin();

  const record = await prisma.product.update({
    where: { id },
    data: data as any,
  });
  return toProduct(record);
}

export function parseStorefrontFilters(
  searchParams: Record<string, string | string[] | undefined>
): { categoryValue: ProductCategory | "all"; sortValue: ProductSort } {
  const result = parseStorefrontFiltersFromSearchParams(searchParams);

  return { 
    categoryValue: (result.category as any) ?? "all",
    sortValue: (result.sort as any) ?? "name_asc"
  };
}




// delete products
export async function deleteProduct(id: string): Promise<void> {
  await requireAdmin();

  // Ürünü Stripe üzerinde arşivliyoruz (active: false)
  const product = await prisma.product.findUnique({
    where: { id }
  });

  if (product) {
    // Stripe Fiyatını arşivle
    if (product.stripePriceId) {
      await stripe.prices.update(product.stripePriceId, { active: false });
    }
    // Stripe Ürününü arşivle
    if (product.stripeProductId) {
      await stripe.products.update(product.stripeProductId, { active: false });
    }
  }

  // Yerel veritabanından kalıcı olarak sil
  await prisma.product.delete({
    where: { id },
  });
}
