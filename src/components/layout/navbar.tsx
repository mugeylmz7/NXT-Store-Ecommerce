import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { getAdmin, getSessionUser } from "@/lib/auth0-utils";
import { Bell, Headphones } from "lucide-react";
import { prisma } from "@/lib/prisma";

export async function Navbar() {
  const user = await getSessionUser();
  const admin = await getAdmin();
  const db = prisma as any;

  // Bildirim Kontrolü (Admin için açılmış açık destek talepleri)
  let hasNotification = false;
  if (user && admin && db) {
    try {
      if (db.supportTicket) {
        const openTicketsCount = await db.supportTicket.count({
          where: { status: "OPEN" },
        });
        hasNotification = openTicketsCount > 0;
      }
    } catch (e) {
      console.error("Navbar notification error:", e);
    }
  }

  const displayName = user?.name ?? user?.email ?? "User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-foreground"
        >
          Ecommerce Store
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
            <Button asChild variant="ghost" size="icon" className="relative size-9">
                <Link
                  href={admin ? "/admin/tickets" : "/user/orders"}
                  title={admin ? "Support Tickets" : "Notifications"}
                >
                  <Bell className="size-4 text-muted-foreground hover:text-foreground transition-colors" />
                  {hasNotification && (
                    <>
                      <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive animate-ping" />
                      <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
                    </>
                  )}
                </Link>
              </Button>
              
              {/* Sadece Müşteriler İçin My Orders Linki (Admin Değilse) */}
              {!admin && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/user/orders">My Orders</Link>
                </Button>
              )}

              {/* Destek Linki */}
              <Button asChild variant="ghost" size="sm">
                <Link href="/support" className="flex items-center gap-1.5">
                  <Headphones className="size-3.5" />
                  Support
                </Link>
              </Button>

              {/* Admin Dashboard Butonu */}
              {admin ? (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin/products">Admin Dashboard</Link>
                </Button>
              ) : null}

              <Separator orientation="vertical" className="hidden h-6 sm:block" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 px-2"
                  >
                    <Avatar size="sm">
                      {user.picture ? (
                        <AvatarImage src={user.picture} alt={displayName} />
                      ) : null}
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-40 truncate sm:inline">
                      {displayName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium">{displayName}</p>
                    {user.email ? (
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    ) : null}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  
                  {/* Dropdown İçi de Sadece Normal Müşteriye Gösterilir */}
                  {!admin && (
                    <DropdownMenuItem asChild>
                      <Link href="/user/orders">My Orders</Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild>
                    <Link href="/support" className="flex items-center gap-2">
                      <Headphones className="size-3.5" />
                      Support & Help
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/logout">Log out</a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild size="sm">
              <a href="/auth/login">Log in</a>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}