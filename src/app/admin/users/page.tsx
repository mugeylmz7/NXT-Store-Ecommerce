import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, UserX, Shield, User as UserIcon } from "lucide-react";
import { UserSuspendButton } from "@/components/admin/users/user-suspend-button";
import { getSessionUser } from "@/lib/auth0-utils";

export const metadata = {
  title: "User Management | Admin Dashboard",
};

export default async function AdminUsersPage() {
  const db = prisma as any;
  const currentUser = await getSessionUser();
  let users: any[] = [];

  try {
    if (db.user) {
      users = await db.user.findMany({
        orderBy: { createdAt: "desc" },
      });
    }
  } catch (error) {
    console.error("Failed to fetch users:", error);
  }

  return (
    <main className="w-full space-y-6 px-3 py-6 sm:px-6 sm:py-10">
      {/* BAŞLIK VE ÖZET SAYAÇ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage user accounts, roles, and suspension states.
          </p>
        </div>
        <Badge variant="outline" className="w-fit text-xs px-3 py-4 font-semibold">
          Total Registered: {users.length}
        </Badge>
      </div>

      <Card className="shadow-sm border-border/60">
        <CardHeader className="pb-0">
          <CardTitle className="text-base font-semibold">All Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users found in database.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => {
                  // Kullanıcı Auth0 veya DB üzerinde admin mi kontrolü
                  const isAdminRole = u.role === "ADMIN" || u.email === process.env.ADMIN_EMAIL;
                  const isSelf = currentUser?.email === u.email;

                  return (
                    <TableRow key={u.id}>
                      {/* Kullanıcı Bilgisi */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground flex items-center gap-1.5">
                            {u.name || "No Name"}
                            {isSelf && (
                              <span className="text-[10px] bg-muted px-1.5 py-0.2 rounded font-mono text-muted-foreground">
                                (You)
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">{u.email}</span>
                        </div>
                      </TableCell>

                      {/* Rol */}
                      <TableCell>
                        {isAdminRole ? (
                          <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 flex w-fit items-center gap-1 font-bold">
                            <Shield className="size-3" />
                            ADMIN
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex w-fit items-center gap-1">
                            <UserIcon className="size-3 text-muted-foreground" />
                            USER
                          </Badge>
                        )}
                      </TableCell>

                      {/* Durum */}
                      <TableCell>
                        {u.isSuspended ? (
                          <Badge variant="destructive" className="flex w-fit items-center gap-1 font-bold">
                            <UserX className="size-3" />
                            Suspended
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 flex w-fit items-center gap-1 font-medium">
                            <UserCheck className="size-3" />
                            Active
                          </Badge>
                        )}
                      </TableCell>

                      {/* Kayıt Tarihi */}
                      <TableCell className="text-xs text-muted-foreground">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                      </TableCell>

                      {/* Aksiyonlar */}
                      <TableCell className="text-right">
                        {/* Admin kendi hesabını veya diğer Adminleri askıya alamaz */}
                        {!isAdminRole && !isSelf ? (
                          <UserSuspendButton
                            userId={u.id}
                            isSuspended={!!u.isSuspended}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground italic pr-2">
                            Protected
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}