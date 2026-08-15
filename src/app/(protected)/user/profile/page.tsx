import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSessionUser, isAdmin } from "@/lib/auth0-utils";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { updateUserAddress, updateUserProfile } from "./actions";
import ProfileForm from "./profile-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";


export default async function ProfilePage() {
  const user = await getSessionUser();

  if (!user || !user.sub) {
    return (
      <div className="mt-6 p-6 text-center">
        <p className="text-muted-foreground">You must be logged in to view this page.</p>
        <Button asChild className="mt-4">
          <Link href="/auth/login">Login</Link>
        </Button>
      </div>
    );
  }

  // Kullanıcı ilk kez profiline girdiğinde MongoDB kaydı yoksa oluşturuyoruz (Upsert)
  const dbUser = await prisma.user.upsert({
    where: { auth0Id: user.sub },
    update: {},  // Kullanıcı varsa hiçbir verisini ezmiyoruz, sadece getiriyoruz
    create: {
      auth0Id: user.sub,
      email: user.email || "",
      name: user.name || "",
    },
  });


  // Kullanıcının admin olup olmadığını kontrol ediyoruz
  const userIsAdmin = isAdmin(user);


  return (
    <div className="max-w-4xl mx-auto mt-6 px-4 pb-12 space-y-8">
      {/* Geri Dönüş Butonu */}
      <Button variant="ghost" asChild className="-ml-4 text-muted-foreground hover:text-foreground">
        <Link href="/">← Back to Home</Link>
      </Button>

      {/* 1. BÖLÜM: ÜSTTEKİ ŞIK PROFİL ÖZETİ (KART) */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 border rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
        <Avatar className="h-20 w-20 border-2 border-primary">
          <AvatarImage src={(user.picture as string) || ""} alt={dbUser.name || "User"} />
          <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
            {dbUser.name?.slice(0, 2).toUpperCase() || "US"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{dbUser.name}</h1>
            
            {/* Rolüne göre şık bir rozet (Badge) gösteriyoruz */}
            <div className="mx-auto md:mx-0">
              {userIsAdmin ? (
                <Badge variant="default" className="bg-red-600 hover:bg-red-700 text-white">
                  Administrator
                </Badge>
              ) : (
                <Badge variant="secondary">Customer</Badge>
              )}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">{dbUser.email}</p>
        </div>

        {/* Admin ise doğrudan yönetim paneline gidebileceği hızlı bir buton */}
        {userIsAdmin && (
          <Button asChild variant="outline" size="sm" className="w-full md:w-auto">
            <Link href="/admin">Admin Dashboard</Link>
          </Button>
        )}
      </div>

      <hr className="border-muted" />

      {/* 2. BÖLÜM: ALTTAKİ DÜZENLEME AYARLARI VE FORMLAR */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Account Settings</h2>
          <p className="text-sm text-muted-foreground">
            Update your personal details, email, and shipping address down below.
          </p>
        </div>
        
        {/* Formu buraya çağırıp veritabanı bilgilerini teslim ediyoruz */}
        <ProfileForm dbUser={dbUser} />
      </div>
    </div>
  );
}