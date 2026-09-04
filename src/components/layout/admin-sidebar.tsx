"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  PackagePlus,
  ShoppingBag,
  Users,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const adminLinks = [
  { href: "/admin/products", label: "Products", icon: LayoutGrid },
  { href: "/admin/products/new", label: "Create product", icon: PackagePlus },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/tickets", label: "Support Tickets", icon: Headphones },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* MOBİL VE TABLET İÇİN: Üst Yatay Kaydırılabilir Navigasyon */}
      <div className="sticky top-16 z-40 w-full border-b border-border bg-card p-2 md:hidden overflow-x-auto custom-scrollbar">
        <nav className="flex items-center gap-1 min-w-max">
          {adminLinks.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href ||
              (href === "/admin/products" &&
                pathname.startsWith("/admin/products/") &&
                !pathname.startsWith("/admin/products/new"));

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* MASAÜSTÜ İÇİN: Standart Sidebar */}
    <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:block">
      <div className="flex h-full flex-col gap-1 p-4">
        <p className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Admin
        </p>
        <nav className="flex flex-col gap-1">
          {adminLinks.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href ||
              (href === "/admin/products" &&
                pathname.startsWith("/admin/products/") &&
                !pathname.startsWith("/admin/products/new"));

            const isTickets = href === "/admin/tickets";

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className="size-4" />
                  <span>{label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  </>
  );
}