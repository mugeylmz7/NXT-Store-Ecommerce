
// A: Yönetici Token'ı Almak (getManagementToken)
async function getManagementToken() {
  // Auth0 Domain, M2M Client ID ve Client Secret bilgilerini .env dosyasından okuyoruz
  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_MANAGEMENT_CLIENT_ID;
  const clientSecret = process.env.AUTH0_MANAGEMENT_CLIENT_SECRET;

  if (!domain || !clientId || !clientSecret) {
    throw new Error("Management API credentials are empty in environmental variables.");
  }


  // 1. Auth0'ın Token üretme servisine POST isteği atıyoruz.
  const response = await fetch(`https://${domain}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,                     // Bizim yeni M2M ID'miz
      client_secret: clientSecret,             // Bizim yeni M2M şifremiz
      audience: `https://${domain}/api/v2/`,   // "Ben Management API v2'yi kullanmak istiyorum" diyoruz
      grant_type: "client_credentials",        // M2M uygulamaları için standart protokol tipi
    }),
  });


  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Auth0 Token Error: ${data.error_description || data.error}`);
  }
  return data.access_token;   // 2. Bize dönen geçici şifreyi (access_token) teslim alıyoruz.
}


// B: Kullanıcıyı Güncellemek (updateAuth0UserProfile)
// 1. Aşağıdaki fonksiyon, Auth0'daki kullanıcıyı güncellemek için kullanılır. Bu fonksiyondan Giriş Kartımızı alıyoruz:
export async function updateAuth0UserProfile(userId: string, updatedData: { name?: string; email?: string}) {
  const domain = process.env.AUTH0_DOMAIN;
  const token = await getManagementToken();

  // 2. Auth0 dökümantasyonundaki adrese (https://domain/api/v2/users/USER_ID) PATCH isteği atıyoruz:
  const response = await fetch(`https://${domain}/api/v2/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,    // Giriş kartımızı buraya ekliyoruz
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),   // 3. Değişecek veriyi (yani yeni ismi) paketleyip gönderiyoruz:
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Auth0 Update Error: ${data.message || "Unknown error"}`);
  }
  return data;
}