import { prisma } from "@/lib/prisma";

// 1. Profil Bilgilerini (İsim ve E-posta) Güncelleyen Servis
export async function updateUserProfileService(
  auth0Id: string, 
  data: { name: string; email: string }
) {
  return await prisma.user.update({
    where: { auth0Id },
    data: {
      name: data.name,
      email: data.email,
    },
  });
}

// 2. Adres Bilgilerini Güncelleyen Servis
export async function updateUserAddressService(
  auth0Id: string, 
  data: { address: string; city?: string; postalCode: string; country?: string; phone?: string }
) {
  return await prisma.user.update({
    where: { auth0Id },
    data: {
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
      country: data.country,
      phone: data.phone,
    },
  });
}