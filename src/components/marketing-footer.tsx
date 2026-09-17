import Link from "next/link";
import { QrCode } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/80 bg-card text-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 sm:items-end">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 font-heading text-base font-bold">
            <span className="flex size-7 items-center justify-center rounded-[8px] bg-primary text-primary-foreground">
              <QrCode className="size-3.5" />
            </span>
            QRForge
          </Link>
          <p className="mt-3 max-w-sm text-xs leading-relaxed text-muted-foreground">
            Enterprise dynamic QR code infrastructure with real-time destination routing, vector PDF/SVG exports, and verified scan telemetry.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-muted-foreground sm:justify-end">
          <Link href="/#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/docs/api" className="hover:text-foreground transition-colors">API Docs</Link>
          <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-[11px] text-muted-foreground">
        &copy; {new Date().getFullYear()} QRForge Platform, Inc. All rights reserved. Built for enterprise scale.
      </div>
    </footer>
  );
}
