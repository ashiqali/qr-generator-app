import Link from "next/link";
import { QrCode } from "lucide-react";
import { GlowGridBg } from "@/components/glow-grid-bg";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-8 overflow-hidden p-6">
      <GlowGridBg />
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <QrCode className="size-4.5" />
        </div>
        QRForge
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
