import { createProductFormSchema, productCategorySchema } from "@/lib/validation/product";
import { Currency } from "@/types/currency";
import { ProductCategory } from "@/types/product";


// Next.js'in 'server-only' paketini test ortamında kullanmak için jest.config.js dosyasında 'server-only' modülünü mock'lamamız gerekiyor. Bu, Next.js'in server-only modülünün test sırasında çalışmasını sağlar.
jest.mock('server-only', () => ({}));

describe('productValidation', () => { 
  // TEST SENARYOSU 1: Kategori Şeması
  describe('productCategorySchema', () => {
    it('should validate a valid category', () => {
      // Projedeki ProductCategory enum'ından bir değer alıyoruz
      const validCategory = Object.values(ProductCategory)[0];
      const result = productCategorySchema.safeParse(validCategory);
      
      expect(result.success).toBe(true);
    });
  });

  // TEST SENARYOSU 2: Ürün Formu Şeması (Input Kontrolleri)
  describe('createProductFormSchema', () => {
    const validFormData = {
      name: "Test Product 2",
      description: "This is a test product.",
      price: "199.99", 
      currency: Currency.TRY || "TRY",
      category: Object.values(ProductCategory)[0],
      stock: "15",
      isActive: true,
    };
    
    it('should validate a valid product form input', () => {
      const result = createProductFormSchema.safeParse(validFormData);
      
      expect(result.success).toBe(true);
    });

    it('should fail validation for an invalid price', () => {
      const invalidPriceData = { ...validFormData, price: "invalid-price" };
      const result = createProductFormSchema.safeParse(invalidPriceData);
      
      expect(result.success).toBe(false);
    });

    it('should fail validation for a negative stock', () => {
      const invalidStockData = { ...validFormData, stock: "-5" };
      const result = createProductFormSchema.safeParse(invalidStockData);
      
      expect(result.success).toBe(false);
    });
  });

    // TEST SENARYOSU 3: Veritabanı Dönüşüm Şeması (Transform)
    describe('createProductDataSchema', () => {
      it('should transform valid form input to database format', () => {
        const validFormData = {
          name: "Test Product 3",
          description: "This is a test product.",
          price: "359.99", 
          currency: Currency.TRY || "TRY",
          category: Object.values(ProductCategory)[0],
          stock: "20",
          isActive: true,
        };

        const result = createProductFormSchema.safeParse(validFormData);
        expect(result.success).toBe(true);

        if (result.success) {
          // '359.99' string fiyatının 35999 cent/kuruş sayısına dönüştüğünü kontrol ediyoruz
          expect(result.data.price).toBe("359.99");
          // '20' string stok değerinin 20 sayısına dönüştüğünü kontrol ediyoruz
          expect(result.data.stock).toBe("20");
        }
    });
  });
});