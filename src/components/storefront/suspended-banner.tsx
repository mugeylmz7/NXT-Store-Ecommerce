import { getSessionUser } from "@/lib/auth0-utils";
import { prisma } from "@/lib/prisma";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export async function SuspendedBanner() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;

  const db = prisma as any;
  const dbUser = await db.user.findUnique({
    where: { email: sessionUser.email },
  });

  if (!dbUser?.isSuspended) return null;

  return (
    <div className="bg-destructive text-destructive-foreground px-4 py-2.5 text-xs font-medium flex items-center justify-center gap-2 text-center sticky top-0 z-50">
      <AlertTriangle className="size-4 shrink-0" />
      <span>
        Your account is currently suspended. You cannot place new orders. For assistance, please{" "}
        <Link href="/support" className="underline font-bold hover:text-white">
          contact support
        </Link>.
      </span>
    </div>
  );
}