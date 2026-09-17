import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles, ArrowUpRight, Zap, Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/plans";
import { Badge } from "@/components/ui/badge";
import { DashboardNav } from "./dashboard-nav";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { SearchTrigger } from "./search-trigger";
import { ThemeToggle } from "@/components/theme-toggle";

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
    <div className="flex min-h-svh bg-background text-foreground">
      {/* Floating Modern Sidebar Desktop */}
      <aside className="hidden w-72 shrink-0 flex-col justify-between border-r border-border/80 bg-card/60 backdrop-blur-xl p-5 md:flex">
        <div className="space-y-6">
          {/* Workspace Switcher */}
          <WorkspaceSwitcher planName={plan.name} />

          {/* Navigation */}
          <DashboardNav />
        </div>

        {/* Sidebar Quota / Upgrade Card */}
        <div className="mt-auto space-y-3.5 rounded-[20px] border border-border/80 bg-muted/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-primary" />
              <span className="text-xs font-bold text-foreground">{plan.name} Plan</span>
            </div>
            <Badge variant={planKey === "FREE" ? "secondary" : "default"} className="text-[10px] rounded-full px-2 py-0.5">
              {planKey === "FREE" ? "Standard" : "Active"}
            </Badge>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
              <span>QR Code Quota</span>
              <span className="font-semibold text-foreground">
                {qrCount} / {isUnlimited ? "∞" : plan.maxQrCodes}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${isUnlimited ? Math.max(8, usagePercentage) : usagePercentage}%` }}
              />
            </div>
          </div>

          {planKey === "FREE" && (
            <Link
              href="/dashboard/billing"
              className="group flex items-center justify-between rounded-[12px] bg-card px-3 py-2 text-xs font-semibold text-primary shadow-2xs ring-1 ring-border/80 transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-xs"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3.5" />
                Upgrade to Pro
              </span>
              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          )}
        </div>
      </aside>

      {/* Main App Container */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        {/* Premium Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/80 bg-background/85 px-4 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-3">
            <MobileNav planName={plan.name} />
            <div className="hidden items-center gap-2 text-xs font-medium text-muted-foreground md:flex">
              <span className="rounded-md bg-muted px-2 py-1 text-muted-foreground font-semibold">Campaign Studio</span>
              <span>/</span>
              <span className="text-foreground font-semibold">Workspace</span>
            </div>
          </div>

          {/* Center search & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <SearchTrigger />

            <Link
              href="/dashboard/qr/new"
              className="hidden items-center gap-1.5 rounded-[14px] bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs shadow-primary/25 hover:bg-primary/90 hover:shadow-md hover:shadow-primary/30 transition-all sm:inline-flex"
            >
              <Plus className="size-3.5" />
              <span>Create QR</span>
            </Link>

            <div className="h-4 w-px bg-border hidden sm:block" />

            <ThemeToggle className="hidden sm:inline-flex" />

            <UserMenu name={user.name} email={user.email} planName={plan.name} />
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
