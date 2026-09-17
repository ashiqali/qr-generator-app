import Link from "next/link";
import { QrCode, Plus, Globe, Wifi, Contact2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-border/90 bg-card/60 p-10 text-center shadow-xs">
      <div className="paper-grid absolute inset-0 opacity-40" aria-hidden />

      <div className="relative mx-auto flex max-w-lg flex-col items-center">
        {/* Decorative Badge */}
        <div className="relative mb-6">
          <div className="absolute -inset-2 rounded-full bg-primary/20 blur-xl" aria-hidden />
          <div className="relative flex size-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-inner">
            <QrCode className="size-8 animate-pulse" />
          </div>
        </div>

        <h3 className="font-heading text-xl font-bold tracking-tight text-foreground">
          No QR codes generated yet
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Create high-resolution, trackable QR codes for websites, restaurant menus, product packaging,
          or WiFi credentials.
        </p>

        {/* Primary Action */}
        <div className="mt-6">
          <Button size="lg" className="h-11 rounded-full px-6 shadow-md shadow-primary/20" render={<Link href="/dashboard/qr/new" />}>
            <Plus className="mr-2 size-4" /> Create QR code
          </Button>
        </div>

        {/* Quick start templates */}
        <div className="mt-10 w-full border-t border-border/80 pt-6">
          <p className="mb-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Quick start presets
          </p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <Link
              href="/dashboard/qr/new?type=URL"
              className="group flex flex-col items-center rounded-xl border border-border/80 bg-background/60 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/40 hover:shadow-xs"
            >
              <Globe className="size-5 text-primary transition-transform group-hover:scale-110" />
              <span className="mt-2 text-xs font-semibold text-foreground">Website URL</span>
              <span className="text-[10px] text-muted-foreground">Menus & links</span>
            </Link>

            <Link
              href="/dashboard/qr/new?type=WIFI"
              className="group flex flex-col items-center rounded-xl border border-border/80 bg-background/60 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/40 hover:shadow-xs"
            >
              <Wifi className="size-5 text-primary transition-transform group-hover:scale-110" />
              <span className="mt-2 text-xs font-semibold text-foreground">WiFi Access</span>
              <span className="text-[10px] text-muted-foreground">Instant guest join</span>
            </Link>

            <Link
              href="/dashboard/qr/new?type=VCARD"
              className="group flex flex-col items-center rounded-xl border border-border/80 bg-background/60 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/40 hover:shadow-xs"
            >
              <Contact2 className="size-5 text-primary transition-transform group-hover:scale-110" />
              <span className="mt-2 text-xs font-semibold text-foreground">vCard Contact</span>
              <span className="text-[10px] text-muted-foreground">Digital business card</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
