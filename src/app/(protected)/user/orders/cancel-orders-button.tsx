"use client";

import { useState } from "react";
import { XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cancelOrderAction } from "./actions";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    
    setLoading(true);
    await cancelOrderAction(orderId);
    setLoading(false);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={loading}
      onClick={handleCancel}
      className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      {loading ? (
        <Loader2 className="size-3.5 mr-1 animate-spin" />
      ) : (
        <XCircle className="size-3.5 mr-1" />
      )}
      Cancel Order
    </Button>
  );
}