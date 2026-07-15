import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSessionUser } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { updateUserAddress, updateUserProfile } from "./actions";
import ProfileForm from "./profile-form";


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

  return (
    <div className="mt-6">

      {/* Anasayfaya Dönüş Butonu */}
      <Button variant="ghost" asChild className="mb-4 -ml-4 text-muted-foreground hover:text-foreground">
        <Link href="/">
          ← Back to Home
        </Link>
      </Button>

      <h1 className="text-3xl font-bold tracking-tight mb-8">My Profile</h1>

      {/* Sadece temiz veriyi forma gönderiyoruz */}
      <ProfileForm dbUser={dbUser} />
    </div>
  );
}