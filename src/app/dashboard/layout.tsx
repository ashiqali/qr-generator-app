import Link from "next/link";
import { redirect } from "next/navigation";
import { QrCode } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { PLANS } from "@/lib/plans";
import { Badge } from "@/components/ui/badge";
import { DashboardNav } from "./dashboard-nav";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const plan = PLANS[(user.plan as keyof typeof PLANS) ?? "FREE"];

  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r bg-muted/20 p-4 md:flex">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <QrCode className="size-6" />
          QRForge
        </Link>
        <DashboardNav />
        <div className="mt-auto space-y-2 rounded-lg border bg-card p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current plan</span>
            <Badge variant="secondary">{plan.name}</Badge>
          </div>
          {plan.name === "Free" && (
            <Link href="/dashboard/billing" className="text-xs text-primary underline underline-offset-4">
              Upgrade for more
            </Link>
          )}
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b px-4 py-3 md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <MobileNav />
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <QrCode className="size-5" />
              QRForge
            </Link>
          </div>
          <div className="hidden md:block" />
          <UserMenu name={user.name} email={user.email} />
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
