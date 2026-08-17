import { z } from "zod";
import { ProductSort } from "@/types/product";

export const productSortSchema = z.string().optional().transform((val) => {
  if (!val) return ProductSort.NAME_ASC || "name_asc";
  return val as ProductSort;
});

export const storefrontCategoryFilterSchema = z.string().optional().transform((val) => {
  if (!val || val === "all") return "all";
  return val;
});

export const storefrontSortSchema = productSortSchema;

export const storefrontFiltersSchema = z.object({
  category: storefrontCategoryFilterSchema,
  sort: storefrontSortSchema,
});

export type StorefrontFiltersInput = {
  category: string;
  sort: ProductSort;
};

export function parseStorefrontFiltersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): StorefrontFiltersInput {
  const safeParams = searchParams ?? {};

  const categoryParam = Array.isArray(safeParams.category)
    ? safeParams.category[0]
    : safeParams.category;

  const sortParam = Array.isArray(safeParams.sort)
    ? safeParams.sort[0]
    : safeParams.sort;

  const result = storefrontFiltersSchema.safeParse({
    category: categoryParam ?? "all",
    sort: sortParam ?? ProductSort.NAME_ASC,
  });

  if (result.success) {
    return result.data as StorefrontFiltersInput;
  }

  return { category: "all", sort: ProductSort.NAME_ASC };
}