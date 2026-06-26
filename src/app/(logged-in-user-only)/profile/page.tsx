import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSessionUser } from "@/lib/auth0";
import Link from "next/link";


export default async function ProfilePage() {
  const user = await getSessionUser();

 return (
  <div className="mt-6">

    {/* Anasayfaya Dönüş Butonu */}
      <Button variant="ghost" asChild className="mb-4 -ml-4 text-muted-foreground hover:text-foreground">
        <Link href="/">
          ← Back to Home
        </Link>
      </Button>

      <h1 className="text-3xl font-bold tracking-tight mb-8">My Profile</h1>

      {/* defaultValue="account" diyerek ilk açılışta Hesap Bilgileri sekmesinin görünmesini sağlıyoruz */}
      <Tabs defaultValue="account" className="w-full">

        {/* Sekme Başlıkları */}
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
        </TabsList>
        
        {/* 1. Sekme İçeriği: Hesap Bilgileri */}
        <TabsContent value="account" className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">My Information</h2>
          <div className="space-y-4 text-sm mb-6">
            <div className="grid grid-cols-3 gap-4">
              <span className="font-medium text-muted-foreground">Name:</span>
              <span className="col-span-2">{user?.name || "Not specified"}</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <span className="font-medium text-muted-foreground">Email:</span>
              <span className="col-span-2">{user?.email}</span>
            </div>
          </div>
          <Button variant="default">Update Information</Button>
        </TabsContent>

        {/* 2. Sekme İçeriği: Adres Bilgileri */}
        <TabsContent value="address" className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-6">My Address</h2>


          <form className="space-y-6">

            <div className="space-y-2">
                <label htmlFor="address">
                Address
                </label>
                <input
                  id="address"
                  name="address"
                  aria-label="Address"
                  />
              </div>

             {/* Şehir ve Posta Kodu: Yan yana 2 kolon */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" placeholder="Enter your city" aria-label="City" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" name="postalCode" placeholder="Enter your postal code" aria-label="Postal Code" />
              </div>
            </div>
            
            {/* Ülke ve Telefon Numarası: Yan yana 2 kolon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" placeholder="Enter your country" aria-label="Country" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" placeholder="Enter your phone number" aria-label="Phone Number" />
              </div>
            </div>
            <div className="pt-2">
              <Button type="submit" variant="default">Update Address
              </Button>
            </div>
            </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
