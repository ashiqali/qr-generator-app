"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { archiveQrAction, deleteQrAction } from "../actions";

export function QrDetailActions({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleArchive() {
    startTransition(async () => {
      await archiveQrAction(id);
      toast.success("QR code archived");
      router.push("/dashboard");
    });
  }

  function handleDelete() {
    if (!confirm("Permanently delete this QR code? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteQrAction(id);
      toast.success("QR code deleted");
      router.push("/dashboard");
    });
  }

  return (
    <div className="flex gap-2">
      <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={handleArchive}>
        <Archive className="mr-1.5 size-3.5" /> Archive
      </Button>
      <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={handleDelete}>
        <Trash2 className="mr-1.5 size-3.5" /> Delete
      </Button>
    </div>
  );
}
