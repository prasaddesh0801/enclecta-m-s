"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

export default function ClientStatusUpdater({ clientId, currentStatus }: { clientId: string, currentStatus: string }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const STAGES = [
    { id: "LEAD", label: "Lead" },
    { id: "CONTACTED", label: "Contacted" },
    { id: "PROPOSAL_SENT", label: "Proposal Sent" },
    { id: "ONBOARDED", label: "Onboarded" },
    { id: "ACTIVE", label: "Active" },
    { id: "INACTIVE", label: "Inactive" }
  ];

  const handleUpdate = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">Update Stage:</span>
      <select
        disabled={isUpdating}
        value={currentStatus}
        onChange={(e) => handleUpdate(e.target.value)}
        className="px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-sm font-medium focus:outline-none focus:border-primary/50 transition-colors cursor-pointer appearance-none disabled:opacity-50"
      >
        {STAGES.map(stage => (
          <option key={stage.id} value={stage.id} className="bg-background">
            {stage.label}
          </option>
        ))}
      </select>
    </div>
  );
}
