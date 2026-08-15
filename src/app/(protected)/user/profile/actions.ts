'use server';

import { getSessionUser } from "@/lib/auth0-utils";
import { updateAuth0UserProfile } from "@/lib/auth0Management";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateUserProfileService, updateUserAddressService } from "@/services/userService";

// Zod şemaları ile form verilerini doğrulamak için kullanıyoruz
const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long"),
  email: z.string().trim().email("Please enter a valid email address."),
});


const addressSchema = z.object({
  address: z.string().trim().min(1, "Address is required."),
  city: z.string().trim().optional(),
  postalCode: z.string().trim().regex(/^\d{5}$/, "Postal code must be exactly 5 digits."),
  country: z.string().trim().optional(),
  phone: z.string().trim().regex(/^\+?[0-9\s\-()]{10,15}$/, "Please enter a valid phone number."),
});



// 1. Hesap Bilgilerini (İsim ve E-posta) Hem Auth0'da Hem MongoDB'de Güncelleme Action'ı
export async function updateUserProfile(formdata: FormData) {

  const user = await getSessionUser();
  if (!user || !user.sub) {
    throw new Error("User not authenticated");
  }

 const rawData = {
  name : formdata.get("name"),
  email : formdata.get("email"),
};

const validatedData = profileSchema.parse(rawData); 

  try {
    // A. Önce Auth0 tarafındaki bilgileri (isim ve mail) güncelliyoruz
    await updateAuth0UserProfile(user.sub, { 
      name: validatedData.name,
      email: validatedData.email
    });
    
    await updateUserProfileService(user.sub, validatedData); // B. MongoDB tarafında da güncelleme yapıyoruz

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

  const rawData = {
    address: formdata.get("address") as string,
    city: formdata.get("city") as string,
    postalCode: formdata.get("postalCode") as string,
    country: formdata.get("country") as string,
    phone: formdata.get("phone") as string,
  };

  const validatedData = addressSchema.parse(rawData);


  try {
    await updateUserAddressService(user.sub, {
        address: validatedData.address,
        city: validatedData.city || "",
        postalCode: validatedData.postalCode || "",
        country: validatedData.country || "",
        phone: validatedData.phone || "",
    });

    revalidatePath("/user/profile"); // Sayfayı yenilemek için revalidatePath kullanıyoruz
  } catch (error) {
    console.error("Error updating user address:", error);
    throw new Error("Failed to update user address");
  }
}
