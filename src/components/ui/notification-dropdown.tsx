"use client";

import { useState, useEffect } from "react";
import { Bell, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  getNotificationsAction,
  markNotificationAsReadAction,
  deleteNotificationAction,
} from "@/app/actions/notifications";

export function NotificationDropdown({ userIsAdmin }: { userIsAdmin: boolean }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const fetchNotifications = async () => {
    const data = await getNotificationsAction();
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 10 sn'de bir canlı güncelleme
    return () => clearInterval(interval);
  }, []);

  // Bildirime tıklanınca: Okundu yap, kırmızılığı kaldır ve ilgili sayfaya git
  const handleNotificationClick = async (n: any) => {
    if (!n.isRead) {
      await markNotificationAsReadAction(n.id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
      );
    }
    // KONTROL VE YÖNLENDİRME DÜZELTMESİ:
    // Eğer link "/profile" ise (404 vermemesi için) veya bildirim başlığında "Suspended" geçiyorsa doğrudan /support'a yönlendir.
    if (n.link === "/profile" || n.title?.includes("Suspended")) {
      router.push("/support");
    } else if (n.link) {
      router.push(n.link);
    } else {
      router.push(userIsAdmin ? "/admin/tickets" : "/user/orders");
    }
  };

  // Bildirimi Sil
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotificationAction(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative size-9">
          <Bell className="size-4 text-foreground" />
          {unreadCount > 0 && (
            <>
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive animate-ping" />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 sm:w-96 p-4 shadow-xl rounded-2xl z-50 bg-popover">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            <h4 className="font-bold text-sm tracking-tight">Notifications</h4>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-[10px] font-bold px-2 py-0.5">
              {unreadCount} Unread
            </Badge>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto my-2 space-y-2 pr-1">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
              <CheckCircle2 className="mx-auto size-7 text-emerald-500/60 mb-2" />
              <p className="font-medium">No new notifications</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 group ${
                  n.isRead
                    ? "bg-background/50 border-border/40 opacity-70"
                    : "bg-muted/60 border-primary/20 hover:bg-muted font-medium"
                }`}
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5">
                    {!n.isRead && (
                      <span className="size-1.5 rounded-full bg-primary shrink-0" />
                    )}
                    <p className="text-xs font-semibold text-foreground truncate">{n.title}</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                  <span className="text-[9px] text-muted-foreground/60 block pt-0.5">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="size-6 text-muted-foreground hover:text-destructive shrink-0 opacity-60 group-hover:opacity-100"
                  onClick={(e) => handleDelete(n.id, e)}
                  title="Delete notification"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}