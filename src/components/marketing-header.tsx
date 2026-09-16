import Link from "next/link";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";

export async function MarketingHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-foreground/10 bg-[#f6f4ee]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 font-heading font-bold tracking-tight">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <QrCode className="size-4" />
          </div>
          QRForge
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/#features" className="transition-colors hover:text-foreground">Features</Link>
          <Link href="/#workflow" className="transition-colors hover:text-foreground">How it works</Link>
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/docs/api" className="hover:text-foreground">
            API docs
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button render={<Link href="/dashboard" />}>Dashboard</Button>
          ) : (
            <>
              <Button variant="ghost" className="hidden sm:inline-flex" render={<Link href="/login" />}>
                Sign in
              </Button>
              <Button className="rounded-full px-5" render={<Link href="/signup" />}>Get started</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
