import Link from "next/link";
import { QrCode } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-foreground/10 bg-[#18352b] text-[#f6f4ee]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 sm:items-end">
        <div><Link href="/" className="inline-flex items-center gap-2.5 font-heading text-lg font-bold"><span className="flex size-8 items-center justify-center rounded-full bg-[#d7f171] text-[#18352b]"><QrCode className="size-4" /></span>QRForge</Link><p className="mt-4 max-w-sm text-sm leading-6 text-white/55">Branded, trackable QR infrastructure for teams that care what happens after print.</p></div>
        <div className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/65 sm:justify-end">
          <Link href="/#features" className="hover:text-white">Features</Link>
          <Link href="/pricing" className="hover:text-white">
            Pricing
          </Link>
          <Link href="/docs/api" className="hover:text-white">
            API docs
          </Link>
          <Link href="/login" className="hover:text-white">
            Sign in
          </Link>
        </div><p className="text-xs text-white/40">&copy; {new Date().getFullYear()} QRForge. Built for better connections.</p>
      </div>
    </footer>
  );
}
