'use server';

import { getSessionUser } from "@/lib/auth0";
import { updateAuth0UserProfile } from "@/lib/auth0Management";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// E-posta format doğrulaması için Regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Telefon numarası doğrulaması (Sadece rakam, isteğe bağlı boşluk/parantez ve 10-15 hane arası)
const PHONE_REGEX = /^\+?[0-9\s\-()]{10,15}$/;
// Posta kodu doğrulaması (Tam olarak 5 haneli rakam)
const POSTAL_CODE_REGEX = /^\d{5}$/;


// 1. Hesap Bilgilerini (İsim ve E-posta) Hem Auth0'da Hem MongoDB'de Güncelleme Action'ı
export async function updateUserProfile(formdata: FormData) {

  const user = await getSessionUser();
  if (!user || !user.sub) {
    throw new Error("User not authenticated");
  }


  const name = formdata.get("name");
  const email = formdata.get("email");

  // Doğrulamalar (Validation)
  if (typeof name !== "string" || !name.trim() || name.trim().length < 2) {
    throw new Error("Name is required and must be at least 2 characters long");
  }

  if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
    throw new Error("Please enter a valid email address.");
  }

  try {
    // A. Önce Auth0 tarafındaki bilgileri (isim ve mail) güncelliyoruz
    await updateAuth0UserProfile(user.sub, { name, email });
    
    // B. Sonra MongoDB tarafındaki ismi ve email'i güncelliyoruz
    await prisma.user.update({
      where: { auth0Id: user.sub },
      data: { name, email },
    });


    revalidatePath("/user/profile"); // Sayfayı yenilemek için revalidatePath kullanıyoruz
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("Failed to update user profile");
  }
}


// 2. Adres Bilgilerini Sadece MongoDB'de Güncelleme Action'ı

export async function updateUserAddress(formdata: FormData) {

  const user = await getSessionUser();
  if (!user || !user.sub) {
    throw new Error("User not authenticated");
  }

  const address = formdata.get("address");
  const city = formdata.get("city");
  const postalCode = formdata.get("postalCode");
  const country = formdata.get("country");
  const phone = formdata.get("phone");

// Doğrulamalar (Validation)
  if (typeof address !== "string" || !address.trim()) {
    throw new Error("Address is required.");
  }

  if (typeof postalCode !== "string" || !POSTAL_CODE_REGEX.test(postalCode)) {
    throw new Error("Postal code must be exactly 5 digits.");
  }

  if (phone && (typeof phone !== "string" || !PHONE_REGEX.test(phone))) {
    throw new Error("Please enter a valid phone number.");
  }

  try {
    await prisma.user.update({
      where: { auth0Id: user.sub },
      data: {
        address: address as string,
        city: city as string,
        postalCode: postalCode as string,
        country: country as string,
        phone: phone as string,
      },
    });

    revalidatePath("/user/profile"); // Sayfayı yenilemek için revalidatePath kullanıyoruz
  } catch (error) {
    console.error("Error updating user address:", error);
    throw new Error("Failed to update user address");
  }
}
