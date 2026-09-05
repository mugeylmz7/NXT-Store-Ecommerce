import { Headphones, CheckCircle2, Clock, MessageSquare, Tag, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { toggleTicketStatusAction, deleteTicketAction } from "./actions";

export const metadata = {
  title: "Support Tickets | Admin Dashboard",
};

export const dynamic = "force-dynamic";

export default async function AdminTicketsPage() {
  const db = prisma as any;
  let tickets: any[] = [];

  try {
    if (db.supportTicket) {
      tickets = await db.supportTicket.findMany({
        orderBy: { createdAt: "desc" },
      });
    }
  } catch (err) {
    console.error("Fetch support tickets error:", err);
  }

  return (
    <main className="container max-w-5xl mx-auto space-y-6 p-6 py-10">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
        <p className="text-sm text-muted-foreground">
          View and manage customer inquiries and support requests.
        </p>
      </div>

      {tickets.length === 0 ? (
        <Card className="border-dashed text-center p-8">
          <CardHeader>
            <Headphones className="mx-auto size-12 text-muted-foreground mb-2" />
            <CardTitle>No support tickets yet</CardTitle>
            <CardDescription>When customers send support messages, they will appear here.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const isResolved = ticket.status === "RESOLVED";

            return (
              <Card key={ticket.id} className="border-border/80 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-bold">{ticket.subject}</CardTitle>
                        <Badge
                          variant={isResolved ? "default" : "secondary"}
                          className={
                            isResolved
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                          }
                        >
                          {isResolved ? "RESOLVED" : "OPEN"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5" />
                          Received: {new Date(ticket.createdAt).toLocaleString("en-US")}
                        </span>
                        {ticket.orderId && (
                          <span className="flex items-center gap-1 font-mono text-primary">
                            <Tag className="size-3.5" />
                            Order ID: {ticket.orderId}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* AKSİYON BUTONLARI (Status Değiştir & Sil) */}
                    <div className="flex items-center gap-2">
                      <form
                        action={async () => {
                          "use server";
                          await toggleTicketStatusAction(ticket.id, isResolved ? "OPEN" : "RESOLVED");
                        }}
                      >
                        <Button size="sm" variant={isResolved ? "outline" : "default"} className="text-xs">
                          <CheckCircle2 className="size-3.5 mr-1" />
                          {isResolved ? "Reopen Ticket" : "Mark as Resolved"}
                        </Button>
                      </form>

                      {/* SILME BUTONU */}
                      <form
                        action={async () => {
                          "use server";
                          await deleteTicketAction(ticket.id);
                        }}
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive px-2.5"
                          title="Delete Ticket"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  <div className="bg-muted/40 p-3.5 rounded-lg border border-border/40 text-xs leading-relaxed text-foreground whitespace-pre-wrap flex items-start gap-2">
                    <MessageSquare className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                    <div>{ticket.message}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}