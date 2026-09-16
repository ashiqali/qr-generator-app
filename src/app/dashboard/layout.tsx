import Link from "next/link";
import { redirect } from "next/navigation";
import { QrCode, Sparkles, ArrowUpRight, Zap } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/plans";
import { Badge } from "@/components/ui/badge";
import { DashboardNav } from "./dashboard-nav";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const planKey = (user.plan as keyof typeof PLANS) ?? "FREE";
  const plan = PLANS[planKey];

  const qrCount = await prisma.qrCode.count({
    where: { ownerId: user.id, archivedAt: null },
  });

  const isUnlimited = plan.maxQrCodes === Infinity;
  const usagePercentage = isUnlimited
    ? Math.min(100, Math.round((qrCount / 50) * 100))
    : Math.min(100, Math.round((qrCount / plan.maxQrCodes) * 100));

  return (
    <div className="flex min-h-svh bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden w-68 shrink-0 flex-col justify-between border-r border-border/80 bg-card/60 backdrop-blur-md p-5 md:flex">
        <div className="space-y-7">
          {/* Brand header */}
          <Link href="/dashboard" className="group flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 ring-1 ring-white/20 transition-transform group-hover:scale-105">
                <QrCode className="size-5" />
              </div>
              <div>
                <span className="font-heading text-base font-bold tracking-tight text-foreground">
                  QRForge
                </span>
                <p className="text-[11px] font-medium text-muted-foreground">Campaign Studio</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live
            </span>
          </Link>

          {/* Navigation */}
          <DashboardNav />
        </div>

        {/* Sidebar plan card */}
        <div className="mt-auto space-y-3 rounded-2xl border border-border/90 bg-muted/40 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">{plan.name} Tier</span>
            </div>
            <Badge variant={planKey === "FREE" ? "secondary" : "default"} className="text-[10px]">
              {planKey === "FREE" ? "Standard" : "Active"}
            </Badge>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>QR Code Quota</span>
              <span className="font-medium text-foreground">
                {qrCount} / {isUnlimited ? "∞" : plan.maxQrCodes}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${isUnlimited ? Math.max(5, usagePercentage) : usagePercentage}%` }}
              />
            </div>
          </div>

          {planKey === "FREE" && (
            <Link
              href="/dashboard/billing"
              className="group flex items-center justify-between rounded-lg bg-card px-2.5 py-1.5 text-xs font-medium text-primary shadow-xs ring-1 ring-border/80 transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3.5" />
                Unlock Dynamic & API
              </span>
              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/70 bg-background/80 px-4 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-3">
            <MobileNav />
            <div className="flex items-center gap-2 md:hidden">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <QrCode className="size-4" />
              </div>
              <span className="font-heading font-bold">QRForge</span>
            </div>
            <div className="hidden items-center gap-2 text-xs font-medium text-muted-foreground md:flex">
              <span className="rounded-md bg-muted px-2 py-1 text-muted-foreground">Workspace</span>
              <span>/</span>
              <span className="text-foreground">Operations</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/qr/new"
              className="hidden items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 sm:inline-flex"
            >
              <Sparkles className="size-3.5" />
              Quick Create
            </Link>
            <div className="h-4 w-px bg-border" />
            <UserMenu name={user.name} email={user.email} />
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
