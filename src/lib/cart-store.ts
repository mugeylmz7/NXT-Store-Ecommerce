export type CartItem = {
  stripePriceId: string;
  quantity: number;
  name?: string; // Görsel kolaylık için
};


// Aktif oturum açan kullanıcının sepet key'ini dinamik belirler
const getCartKey = (): string => {
  if (typeof window === "undefined") return "shopping-cart-guest";
  
  // Auth0 veya session'dan saklanan aktif kullanıcı ID/email bilgisini alıyoruz
  const activeUser = localStorage.getItem("current_user_email") || "guest";
  return `shopping-cart_${activeUser}`;
};


export const getCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  const cartKey = getCartKey();
  const cart = localStorage.getItem(cartKey);
  return cart ? JSON.parse(cart) : [];
};

export const addToCart = (item: CartItem) => {
  if (typeof window === "undefined") return;
  const cart = getCart();
  const existingItem = cart.find((i) => i.stripePriceId === item.stripePriceId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push(item);
  }

  const cartKey = getCartKey();
  localStorage.setItem(cartKey, JSON.stringify(cart));
  // Sayfadaki sepet sayılarının güncellenmesi için event tetikliyoruz
  window.dispatchEvent(new Event("cart-updated"));
};

export const clearCart = () => {
  if (typeof window === "undefined") return;
  const cartKey = getCartKey();
  localStorage.removeItem(cartKey);
  window.dispatchEvent(new Event("cart-updated"));
};

// Sepetten sadece seçilen ürünü silen/adet azaltan fonksiyon
export const removeFromCart = (stripePriceId: string) => {
  if (typeof window === "undefined") return;
  let cart = getCart();
  const existingItem = cart.find((item) => item.stripePriceId === stripePriceId);
 
  if (existingItem) {
    if (existingItem.quantity > 1) {
      existingItem.quantity -= 1;
    } else {
      cart = cart.filter((item) => item.stripePriceId !== stripePriceId);
    }
  }

  const cartKey = getCartKey();
  localStorage.setItem(cartKey, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
};