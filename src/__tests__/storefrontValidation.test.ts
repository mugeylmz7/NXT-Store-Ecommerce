import { parseStorefrontFiltersFromSearchParams, productSortSchema, storefrontCategoryFilterSchema } from "@/lib/validation/storefront";
import { ProductCategory, ProductSort } from "@/types/product";


describe('Storefront Validation & Helper Tests', () => {
  // TEST SENARYOSU 1: Sıralama Şeması (Sort)
  describe('productSortSchema', () => {
    it('should validate valid sort values', () => {
      const validSortValues = Object.values(ProductSort)[0];
      const result = productSortSchema.safeParse(validSortValues);

      expect(result.success).toBe(true);
    });

    it('should invalidate invalid sort values', () => {
      const invalidSortValue = "invalid_sort_value";
      const result = productSortSchema.safeParse(invalidSortValue);

      expect(result.success).toBe(false);
    });
  });

  // TEST SENARYOSU 2: Kategori Filtre Şeması (Union: "all" veya ProductCategory)
  describe('storefrontCategoryFilterSchema', () => {
    it('should validate "all" as a valid category filter', () => {
      const result = storefrontCategoryFilterSchema.safeParse("all");

      expect(result.success).toBe(true);
    });

    it('should validate valid product category values', () => {
      const validCategoryValue = Object.values(ProductCategory)[0];
      const result = storefrontCategoryFilterSchema.safeParse(validCategoryValue);

      expect(result.success).toBe(true);
    });
  });

  // TEST SENARYOSU 3: Arama Parametrelerini Ayrıştırma (Helper Function)
  describe('parseStorefrontFiltersFromSearchParams', () => {
    it('should return default values when no search params are provided', () => {
      const result = parseStorefrontFiltersFromSearchParams({});

      expect(result.category).toBe("all");
      expect(result.sort).toBe(ProductSort.NAME_ASC);
    });

    it('should parse valid search params correctly', () => {
      const searchParams = {
        category: ["all", "other"],
        sort: [ProductSort.NAME_ASC],
      };

      const result = parseStorefrontFiltersFromSearchParams(searchParams);

      expect(result.category).toBe("all");
      expect(result.sort).toBe(ProductSort.NAME_ASC);
    });

    it('should return default values for invalid search params', () => {
      const searchParams = {
        category: ["invalid_category"],
        sort: ["invalid_sort"],
      };

      const result = parseStorefrontFiltersFromSearchParams(searchParams);

      expect(result.category).toBe("all");
      expect(result.sort).toBe(ProductSort.NAME_ASC);
    });
  });
});