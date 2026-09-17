import Link from "next/link";
import {
  Plus,
  QrCode as QrCodeIcon,
  Radio,
  ScanLine,
  TrendingUp,
  Upload,
  BarChart3,
  Users,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCodeTable, type QrCodeRow } from "./qr/qr-code-table";
import { EmptyState } from "./qr/empty-state";
import { ScanTrendChart } from "@/components/scan-trend-chart";
import { getScanTimeSeries } from "@/lib/qr/analytics";
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

  const dynamicQrCodes = qrCodes.filter((qr) => qr.isDynamic);
  const dynamicIds = dynamicQrCodes.map((q) => q.id);
  const dynamicCount = dynamicQrCodes.length;
  const totalScans = qrCodes.reduce((sum, qr) => sum + qr._count.scanEvents, 0);
  const scanRate = qrCodes.length > 0 ? (totalScans / qrCodes.length).toFixed(1) : "0.0";

  const series = await getScanTimeSeries(dynamicIds, 14);

  const rows: QrCodeRow[] = qrCodes.map((qr) => ({
    id: qr.id,
    name: qr.name,
    type: qr.type as QrContentType,
    isDynamic: qr.isDynamic,
    createdAt: qr.createdAt.toISOString(),
    scanCount: qr._count.scanEvents,
  }));

  const quickActions = [
    {
      title: "Create QR Code",
      desc: "Studio builder with live canvas",
      icon: Plus,
      href: "/dashboard/qr/new",
      accent: "bg-primary/10 text-primary border-primary/20",
      primary: true,
    },
    {
      title: "Upload CSV Batch",
      desc: "Generate bulk QR codes at once",
      icon: Upload,
      href: "/dashboard/bulk",
      accent: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    },
    {
      title: "View Telemetry",
      desc: "Device & geographic analytics",
      icon: BarChart3,
      href: "/dashboard/analytics",
      accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      title: "Workspace & Team",
      desc: "Manage security, keys & billing",
      icon: Users,
      href: "/dashboard/settings",
      accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <FadeIn immediate y={10} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Campaign Overview
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live System
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Monitor verified scan telemetry, manage active destinations, and export high-res vector assets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="lg"
            className="h-10 rounded-[14px] px-4 shadow-sm shadow-primary/25 hover:shadow-md"
            render={<Link href="/dashboard/qr/new" />}
          >
            <Plus className="mr-1.5 size-4" /> New QR Code
          </Button>
        </div>
      </FadeIn>

      {/* Large KPI Cards */}
      <StaggerContainer immediate className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <KpiCard
            title="Total QR Codes"
            value={qrCodes.length}
            trend="+12% this month"
            sub="Active in workspace"
            icon={QrCodeIcon}
            accent="indigo"
            sparkline={[3, 5, 4, 8, 7, 9, 12, 10, 14, 16]}
          />
        </StaggerItem>

        <StaggerItem>
          <KpiCard
            title="Total Verified Scans"
            value={totalScans}
            trend="+24.8% velocity"
            sub="All-time verified interactions"
            icon={ScanLine}
            accent="cyan"
            sparkline={[12, 18, 14, 25, 32, 28, 42, 55, 60, 78]}
          />
        </StaggerItem>

        <StaggerItem>
          <KpiCard
            title="Dynamic Deployments"
            value={dynamicCount}
            trend="100% editable"
            sub="Live redirect routing"
            icon={Radio}
            accent="emerald"
            sparkline={[1, 1, 2, 2, 3, 4, 4, 5, 5, 6]}
          />
        </StaggerItem>

        <StaggerItem>
          <KpiCard
            title="Avg Scans / Code"
            value={parseFloat(scanRate)}
            trend="+8.4% engagement"
            sub="Scan efficiency ratio"
            icon={Activity}
            accent="amber"
            sparkline={[4, 6, 5, 7, 8, 9, 11, 12, 14, 15]}
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Quick Actions Panel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
            Quick Actions
          </p>
          <span className="text-[11px] text-muted-foreground">Studio shortcuts</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="group flex items-start gap-3.5 rounded-[20px] border border-border/80 bg-card p-4 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-[12px] border ${action.accent} shadow-2xs transition-transform duration-200 group-hover:scale-110`}
                >
                  <Icon className="size-5" />
                </div>
                <div className="flex-1 truncate">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {action.title}
                    </p>
                    <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{action.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Analytics Chart Preview Section */}
      {dynamicCount > 0 && (
        <FadeIn immediate delay={0.05}>
          <Card className="rounded-[24px] border border-border/80 shadow-xs">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-primary" />
                    <CardTitle className="font-heading text-base font-bold">
                      Scan Volume Velocity (Rolling 14 Days)
                    </CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Real-time interaction telemetry across your dynamic campaigns
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href="/dashboard/analytics" />}
                  className="rounded-[12px] text-xs h-8"
                >
                  Deep-dive Analytics &rarr;
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ScanTrendChart data={series} />
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Campaigns Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
              Campaign Inventory
            </h2>
            <p className="text-xs text-muted-foreground">
              Manage your static and dynamic QR code assets
            </p>
          </div>
        </div>

        {rows.length === 0 ? <EmptyState /> : <QrCodeTable qrCodes={rows} />}
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  trend,
  sub,
  icon: Icon,
  accent,
  sparkline,
}: {
  title: string;
  value: number;
  trend: string;
  sub: string;
  icon: typeof QrCodeIcon;
  accent: "indigo" | "cyan" | "emerald" | "amber";
  sparkline: number[];
}) {
  const accentColor = {
    indigo: "text-primary bg-primary/10 border-primary/20",
    cyan: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
  }[accent];

  const strokeColor = {
    indigo: "#4F46E5",
    cyan: "#06B6D4",
    emerald: "#10B981",
    amber: "#F59E0B",
  }[accent];

  const maxVal = Math.max(...sparkline, 1);
  const minVal = Math.min(...sparkline, 0);
  const range = maxVal - minVal || 1;
  const points = sparkline
    .map((v, i) => {
      const x = (i / (sparkline.length - 1)) * 90 + 5;
      const y = 28 - ((v - minVal) / range) * 22;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-border/80 bg-card p-5 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-border hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <AnimatedCounter
              value={value}
              className="font-heading text-3xl font-extrabold tabular-nums tracking-tight text-foreground"
            />
          </div>
        </div>

        <div
          className={`flex size-10 items-center justify-center rounded-[12px] border ${accentColor} shadow-2xs transition-transform duration-200 group-hover:scale-110`}
        >
          <Icon className="size-5" />
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between pt-2 border-t border-border/60">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="size-3" />
            {trend}
          </span>
          <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>
        </div>

        {/* Mini Sparkline Chart */}
        <div className="w-24 h-8 shrink-0">
          <svg viewBox="0 0 100 32" className="w-full h-full overflow-visible">
            <polyline
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
