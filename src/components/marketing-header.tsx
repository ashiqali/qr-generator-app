import Link from "next/link";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";
import { ThemeToggle } from "@/components/theme-toggle";

export async function MarketingHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 font-heading font-bold tracking-tight text-foreground">
          <div className="flex size-8.5 items-center justify-center rounded-[10px] bg-primary text-primary-foreground shadow-xs shadow-primary/25">
            <QrCode className="size-4.5" />
          </div>
          <span className="text-base font-extrabold">QRForge</span>
        </Link>

        <nav className="hidden items-center gap-7 text-xs font-semibold text-muted-foreground md:flex">
          <Link href="/#features" className="transition-colors hover:text-foreground">Features</Link>
          <Link href="/#workflow" className="transition-colors hover:text-foreground">How it Works</Link>
          <Link href="/pricing" className="transition-colors hover:text-foreground">Pricing</Link>
          <Link href="/docs/api" className="transition-colors hover:text-foreground">API Docs</Link>
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {user ? (
            <Button
              render={<Link href="/dashboard" />}
              className="h-9 rounded-[12px] text-xs font-semibold px-4 shadow-xs shadow-primary/20"
            >
              Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                className="hidden sm:inline-flex h-9 rounded-[12px] text-xs font-semibold"
                render={<Link href="/login" />}
              >
                Sign in
              </Button>
              <Button
                className="h-9 rounded-[12px] px-4.5 text-xs font-semibold shadow-xs shadow-primary/25"
                render={<Link href="/signup" />}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
