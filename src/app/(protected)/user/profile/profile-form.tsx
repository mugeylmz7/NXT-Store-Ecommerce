"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateUserAddress, updateUserProfile } from "./actions";


interface ProfileFormProps {
  dbUser: {
    name: string | null;
    email: string;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    country: string | null;
    phone: string | null;
  };
}

export default function ProfileForm({ dbUser }: ProfileFormProps) {

  // Rakamları otomatik olarak "0555-444-33-22" formatına dönüştüren fonksiyon
  const formatPhoneNumber = (value: string) => {
    // Önce rakam dışındaki her şeyi temizle
    const numbers = value.replace(/\D/g, "");

    // Kullanıcı sildikçe formatın bozulmaması için adım adım inşa ediyoruz
    if (numbers.length <= 4) {
      return numbers; // örn: "0555"
    }
    if (numbers.length <= 7) {
      return `${numbers.slice(0, 4)}-${numbers.slice(4)}`; // örn: "0555-444"
    }
    if (numbers.length <= 9) {
      return `${numbers.slice(0, 4)}-${numbers.slice(4, 7)}-${numbers.slice(7)}`; // örn: "0555-444-33"
    }
    // En fazla 11 rakam olacak şekilde nihai format:
    return `${numbers.slice(0, 4)}-${numbers.slice(4, 7)}-${numbers.slice(7, 9)}-${numbers.slice(9, 11)}`; // örn: "0555-444-33-22"
  };

  // Rakam dışındaki her şeyi silen fonksiyon
  const onlyNumbers = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
  };

  // E-posta kutusuna sadece geçerli karakterlerin yazılmasını sağlar (Boşlukları ve geçersiz karakterleri anında siler)
  const cleanEmailInput = (value: string) => {
    // Sadece küçük/büyük harf, rakam ve @, ., _, - işaretlerine izin ver
    return value.toLowerCase().replace(/[^a-z0-9@._-]/g, "");
  };

  return (
    <Tabs defaultValue="account" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6 h-11 p-1 bg-muted rounded-xl">
        <TabsTrigger value="account" className="rounded-lg text-xs sm:text-sm font-medium">Account</TabsTrigger>
        <TabsTrigger value="address" className="rounded-lg text-xs sm:text-sm font-medium">Address</TabsTrigger>
      </TabsList>

      {/* 1. SEKME: HESAP BİLGİLERİ */}
      <TabsContent value="account" className="border border-border/80 rounded-2xl p-4 sm:p-6 bg-card shadow-sm">
        <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-foreground">My Information</h2>

        <form action={updateUserProfile} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={dbUser.name || ""}
              placeholder="Enter your name"
              required
              minLength={2}
              className="h-10 text-sm" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={dbUser.email || ""}
              placeholder="Enter your email"
              required
              // Sıkı e-posta format doğrulaması (en az bir karakter + @ + en az bir karakter + . + en az iki karakter uzantı)
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}"
              title="Please enter a valid email address (e.g. name@domain.com)"
              className="h-10 text-sm"
              onInput={(e) => {
                // Kullanıcı yazarken boşluk veya geçersiz sembol girmeye çalışırsa anında siler:
                e.currentTarget.value = cleanEmailInput(e.currentTarget.value);
              }}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit" variant="default" className="w-full sm:w-auto rounded-xl px-6 h-10"
              onClick={(e) => {
                // Formun geçerliliğini kontrol et
                const form = e.currentTarget.closest("form");
                if (form && !form.checkValidity()) {
                  e.preventDefault(); // Geçersizse Next.js action'ı engelle
                  form.reportValidity(); // Tarayıcının uyarı balonunu göster
                }
              }}
            >
              Update Information
            </Button>
          </div>
        </form>
      </TabsContent>

      {/* 2. SEKME: ADRES BİLGİLERİ */}
      <TabsContent value="address" className="border border-border/80 rounded-2xl p-4 sm:p-6 bg-card shadow-sm">
        <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-foreground">My Address</h2>

        <form action={updateUserAddress} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              defaultValue={dbUser.address || ""}
              placeholder="Enter your address"
              required
              className="h-10 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                defaultValue={dbUser.city || ""}
                placeholder="Enter your city"
                required
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                name="postalCode"
                defaultValue={dbUser.postalCode || ""}
                placeholder="e.g. 34000"
                required
                maxLength={5}
                className="h-10 text-sm"
                onInput={(e) => {
                  onlyNumbers(e); // Harf yazılmasını engeller
                  if (e.currentTarget.value.length > 5) {
                    e.currentTarget.value = e.currentTarget.value.slice(0, 5); // 5 haneden fazlasını siler
                  }
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                defaultValue={dbUser.country || ""}
                placeholder="Enter your country"
                required
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={dbUser.phone || ""}
                placeholder="e.g. 0555-444-33-22"
                required
                maxLength={14} // Tire işaretleri dahil olacağı için max uzunluğu 14 yapıyoruz (11 rakam + 3 tire)
                className="h-10 text-sm"
                onInput={(e) => {
                  onlyNumbers(e); // Harf yazılmasını engeller
                  // Girilen değeri anında maskelenmiş formata çeviriyoruz
                  e.currentTarget.value = formatPhoneNumber(e.currentTarget.value);
                }}
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit" variant="default" className="w-full sm:w-auto rounded-xl px-6 h-10"
              onClick={(e) => {
                // Formun geçerliliğini kontrol et
                const form = e.currentTarget.closest("form");
                if (form && !form.checkValidity()) {
                  e.preventDefault(); // Geçersizse Next.js action'ı engelle
                  form.reportValidity(); // Tarayıcının uyarı balonunu göster
                }
              }}
            >
              Update Address
            </Button>
          </div>
        </form>
      </TabsContent>
    </Tabs>
  );
}