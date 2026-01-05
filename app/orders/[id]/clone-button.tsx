"use client";

import { useRouter } from "next/navigation";
import { cloneOrder } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function CloneOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClone = async () => {
    if (!confirm("Clone this order with all items and work items?")) {
      return;
    }

    setLoading(true);
    try {
      const newOrder = await cloneOrder(orderId);
      router.push(`/orders/${newOrder.id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to clone order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClone} disabled={loading} variant="outline">
      {loading ? "Cloning..." : "Clone Order"}
    </Button>
  );
}
