'use server';

import {
  createProductDataSchema,
  createProductImagesSchema,
} from '@/lib/validation';
import { createProduct as createProductRecord } from '@/lib/products';
import { Currency } from '@/types/currency';
import { ProductCategory } from '@/types/product';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { stripe } from '@/lib/stripe';
import { uploadProductImagesService } from '@/services/imageService';

export type CreateProductFormValues = {
  name: string;
  description: string;
  price: string;
  currency: Currency;
  category: ProductCategory;
  stock: string;
  isActive: boolean;
};

export type CreateProductFieldErrors = Partial<
  Record<keyof CreateProductFormValues | 'images', string>
>;

export type CreateProductState = {
  message: string;
  values?: CreateProductFormValues;
  fieldErrors?: CreateProductFieldErrors;
};

function parseFormValues(formData: FormData): CreateProductFormValues {
  return {
    name: String(formData.get('name') ?? ''),
    description: String(formData.get('description') ?? ''),
    price: String(formData.get('price') ?? ''),
    currency: String(formData.get('currency') ?? '') as Currency,
    category: String(formData.get('category') ?? '') as ProductCategory,
    stock: String(formData.get('stock') ?? ''),
    isActive: formData.get('isActive') === 'on',
  };
}

function flattenFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): CreateProductFieldErrors {
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([key, messages]) => [
      key,
      messages?.[0] ?? '',
    ]),
  ) as CreateProductFieldErrors;
}

export async function createProduct(
  _prevState: CreateProductState | null,
  formData: FormData,
): Promise<CreateProductState | null> {
  const values = parseFormValues(formData);

  const parsed = createProductDataSchema.safeParse(values);
  if (!parsed.success) {
    return {
      message: 'Please fix the errors below.',
      values,
      fieldErrors: flattenFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }

  const images = formData
    .getAll('images')
    .filter((entry): entry is File => entry instanceof File);
  const imagesParsed = createProductImagesSchema.safeParse(images);
  if (!imagesParsed.success) {
    return {
      message: 'Please fix the errors below.',
      values,
      fieldErrors: {
        images: imagesParsed.error.issues[0]?.message ?? 'Invalid images',
      },
    };
  }

  //Doğrudan put(...) yerine imageService fonksiyonunu kullanıyoruz
  const imageUrls = await uploadProductImagesService(imagesParsed.data);

  let productId: string;
  try {
    // 1. Adım: Stripe üzerinde Ürünü (Product) oluşturuyoruz
    const stripeProduct = await stripe.products.create({
      name: parsed.data.name,
      description: parsed.data.description|| undefined,
      images: imageUrls.length > 0 ? [imageUrls[0]] : undefined,
    });

    // 2. Adım: O ürüne bağlı Fiyatı (Price) oluşturuyoruz (Stripe kuruş/cent beklediği için 100 ile çarptık)
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      // parsed.data.price yerine priceCents kullanıyoruz. Zod şemanız bunu zaten sayı (number) yaptığı için Number() sarmalına da gerek yok.
      unit_amount: Math.round(parsed.data.priceCents),
      currency: parsed.data.currency.toLocaleLowerCase(), // Stripe para birimini küçük harf bekler (usd, try vb.)
    });

    // 3. Adım: Hem doğrulanmış verileri hem resimleri hem de Stripe kimliklerini yerel fonksiyona paslıyoruz
    const result = await createProductRecord({
      ...parsed.data,
      stripePriceId: stripePrice.id,
      stripeProductId: stripeProduct.id,
    },
    imageUrls
    );


    productId = result.id;
  } catch (error: any) {
    console.error("Stripe/Database Creation Error:", error);
    return {
      message: 'Could not create the product. Please try again.',
      values,
    };
  }

  revalidatePath('/admin/products');
  revalidatePath('/');
  redirect(`/admin/products/new?created=${productId}`);
}