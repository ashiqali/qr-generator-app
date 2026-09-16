import Link from "next/link";
import { QrCode, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <QrCode className="size-6 text-muted-foreground" />
      </div>
      <div>
        <p className="font-medium">No QR codes yet</p>
        <p className="text-sm text-muted-foreground">Create your first QR code to get started.</p>
      </div>
      <Button render={<Link href="/dashboard/qr/new" />}>
        <Plus className="mr-2 size-4" /> Create QR code
      </Button>
    </div>
  );
}
