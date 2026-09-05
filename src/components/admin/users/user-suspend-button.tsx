"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserX, UserCheck, Loader2 } from "lucide-react";
import { toggleUserSuspensionAction } from "@/app/admin/users/actions";

type UserSuspendButtonProps = {
  userId: string;
  isSuspended: boolean;
};

export function UserSuspendButton({ userId, isSuspended }: UserSuspendButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await toggleUserSuspensionAction(userId, !isSuspended);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant={isSuspended ? "outline" : "destructive"}
      className={`h-8 text-xs font-semibold ${
        isSuspended 
          ? "border-emerald-600/30 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30" 
          : "text-white"
      }`}
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="size-3.5 animate-spin mr-1.5" />
      ) : isSuspended ? (
        <UserCheck className="size-3.5 mr-1.5 text-emerald-600" />
      ) : (
        <UserX className="size-3.5 mr-1.5" />
      )}
      {isSuspended ? "Unsuspend Account" : "Suspend Account"}
    </Button>
  );
}