export type CartItem = {
  stripePriceId: string;
  quantity: number;
  name?: string; // Görsel kolaylık için
};

export const getCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  const cart = localStorage.getItem("shopping-cart");
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

  localStorage.setItem("shopping-cart", JSON.stringify(cart));
  // Sayfadaki sepet sayılarının güncellenmesi için küçük bir event tetikliyoruz
  window.dispatchEvent(new Event("cart-updated"));
};

export const clearCart = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("shopping-cart");
};

// Sepetten sadece seçilen ürünü silen fonksiyon
export const removeFromCart = (stripePriceId: string) => {
  if (typeof window === "undefined") return;
  const cart = getCart();
  // Silinmek istenen ID dışındaki tüm ürünleri filtrele
  const filteredCart = cart.filter((item) => item.stripePriceId !== stripePriceId);
  
  localStorage.setItem("shopping-cart", JSON.stringify(filteredCart));
  window.dispatchEvent(new Event("cart-updated"));
};