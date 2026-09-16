import Link from "next/link";
import { Plus, QrCode as QrCodeIcon, Radio, ScanLine, Sparkles, TrendingUp } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { QrCodeTable, type QrCodeRow } from "./qr/qr-code-table";
import { EmptyState } from "./qr/empty-state";
import type { QrContentType } from "@/lib/qr/types";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";
import { AnimatedCounter } from "@/components/motion/animated-counter";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const qrCodes = await prisma.qrCode.findMany({
    where: { ownerId: user.id, archivedAt: null },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { scanEvents: true } } },
  });

  const plan = PLANS[(user.plan as keyof typeof PLANS) ?? "FREE"];
  const limitLabel =
    plan.maxQrCodes === Infinity ? "Unlimited active QR codes" : `${qrCodes.length} of ${plan.maxQrCodes} used`;

  const dynamicCount = qrCodes.filter((qr) => qr.isDynamic).length;
  const totalScans = qrCodes.reduce((sum, qr) => sum + qr._count.scanEvents, 0);

  const rows: QrCodeRow[] = qrCodes.map((qr) => ({
    id: qr.id,
    name: qr.name,
    type: qr.type as QrContentType,
    isDynamic: qr.isDynamic,
    createdAt: qr.createdAt.toISOString(),
    scanCount: qr._count.scanEvents,
  }));

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <FadeIn immediate y={10} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            QR Campaigns
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {limitLabel} on the <span className="font-semibold text-foreground">{plan.name}</span> plan
          </p>
        </div>
        <Button
          size="lg"
          className="h-10 rounded-full px-5 shadow-sm shadow-primary/20"
          render={<Link href="/dashboard/qr/new" />}
        >
          <Plus className="mr-2 size-4" /> Create QR code
        </Button>
      </FadeIn>

      {/* Metric Cards */}
      {rows.length > 0 && (
        <StaggerContainer immediate className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StaggerItem>
            <StatCard
              icon={QrCodeIcon}
              label="Total QR Codes"
              sub="Active in workspace"
              value={qrCodes.length}
              accent="emerald"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              icon={Radio}
              label="Dynamic Codes"
              sub="Editable destinations"
              value={dynamicCount}
              accent="amber"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              icon={ScanLine}
              label="Total Scans"
              sub="All-time verified scans"
              value={totalScans}
              accent="indigo"
            />
          </StaggerItem>
        </StaggerContainer>
      )}

      {/* Main Table or Empty State */}
      {rows.length === 0 ? <EmptyState /> : <QrCodeTable qrCodes={rows} />}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  sub,
  value,
  accent,
}: {
  icon: typeof QrCodeIcon;
  label: string;
  sub: string;
  value: number;
  accent: "emerald" | "amber" | "indigo";
}) {
  const accentStyles = {
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  }[accent];

  return (
    <div className="card-sheen elevated-card group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <AnimatedCounter value={value} className="font-heading text-3xl font-bold tabular-nums tracking-tight text-foreground" />
          </div>
          <p className="text-[11px] text-muted-foreground/80">{sub}</p>
        </div>
        <div className={`flex size-11 items-center justify-center rounded-xl border ${accentStyles} shadow-xs transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}
