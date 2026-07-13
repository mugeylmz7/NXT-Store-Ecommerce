import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4 text-center">
      {/* 403 HTTP Durum Kodu: Yasak / Yetkisiz Erişim */}
      <h1 className="text-4xl font-bold text-destructive mb-4 tracking-tighter">403 Forbidden</h1>
      <h2 className="text-xl font-bold tracking-tight mb-3">
        Access Denied
      </h2>

      <p className="text-muted-foreground max-w-md mb-8 text-lg">You do not have permission to access this page.</p>

      <div className="flex gap-4">
        <Button variant="outline" asChild>
          <Link href="/">
            Go to Home
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/login">
            Login
          </Link>
        </Button>
      </div>
    </div>
  );
}