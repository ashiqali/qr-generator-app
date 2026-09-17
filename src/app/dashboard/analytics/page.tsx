import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanTrendChart } from "@/components/scan-trend-chart";
import { BreakdownList } from "@/components/breakdown-list";
import { getScanTimeSeries, getDeviceBreakdown, getCountryBreakdown, getTotalScans } from "@/lib/qr/analytics";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";
import { AnimatedCounter } from "@/components/motion/animated-counter";
import { BarChart3, Globe, Smartphone, Radio, ArrowUpRight, Trophy, Activity } from "lucide-react";
import { QR_TYPE_META, QrTypeIcon } from "../qr/qr-type-icon";
import type { QrContentType } from "@/lib/qr/types";

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const dynamicQrCodes = await prisma.qrCode.findMany({
    where: { ownerId: user.id, isDynamic: true, archivedAt: null },
    select: { id: true, name: true, type: true, createdAt: true },
  });
  const ids = dynamicQrCodes.map((q) => q.id);

  const [series, devices, countries, totalScans, topCodes] = await Promise.all([
    getScanTimeSeries(ids, 30),
    getDeviceBreakdown(ids),
    getCountryBreakdown(ids),
    getTotalScans(ids),
    prisma.qrCode.findMany({
      where: { ownerId: user.id, isDynamic: true, archivedAt: null },
      orderBy: { scanEvents: { _count: "desc" } },
      take: 5,
      include: { _count: { select: { scanEvents: true } } },
    }),
  ]);

  const avgPerCode = ids.length > 0 ? (totalScans / ids.length).toFixed(1) : "0.0";

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <FadeIn immediate y={10} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Campaign Telemetry & Analytics
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Ingestion
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Audience telemetry, geographic distribution, and device metrics across your active dynamic codes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/dashboard/qr/new" />}
            className="h-9 rounded-[12px] text-xs font-semibold"
          >
            Deploy New Code
          </Button>
        </div>
      </FadeIn>

      {/* KPI Overview */}
      <StaggerContainer immediate className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <div className="rounded-[24px] border border-border/80 bg-card p-5 shadow-2xs transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Total Verified Scans</p>
                <div className="mt-2">
                  <AnimatedCounter
                    value={totalScans}
                    className="font-heading text-3xl font-extrabold tabular-nums tracking-tight text-foreground"
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Rolling 30 day window</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-[12px] bg-primary/10 text-primary border border-primary/20">
                <BarChart3 className="size-5" />
              </div>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="rounded-[24px] border border-border/80 bg-card p-5 shadow-2xs transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Dynamic Deployments</p>
                <div className="mt-2">
                  <AnimatedCounter
                    value={ids.length}
                    className="font-heading text-3xl font-extrabold tabular-nums tracking-tight text-foreground"
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Active tracking codes</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-[12px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                <Radio className="size-5" />
              </div>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="rounded-[24px] border border-border/80 bg-card p-5 shadow-2xs transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Audience Regions</p>
                <div className="mt-2">
                  <AnimatedCounter
                    value={countries.length}
                    className="font-heading text-3xl font-extrabold tabular-nums tracking-tight text-foreground"
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Geographic points detected</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-[12px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Globe className="size-5" />
              </div>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="rounded-[24px] border border-border/80 bg-card p-5 shadow-2xs transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Scan Ratio</p>
                <div className="mt-2">
                  <span className="font-heading text-3xl font-extrabold tabular-nums tracking-tight text-foreground">
                    {avgPerCode}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Avg interactions per code</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-[12px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Activity className="size-5" />
              </div>
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Primary Trend Chart Section */}
      <FadeIn immediate delay={0.05}>
        <Card className="rounded-[24px] border border-border/80 shadow-2xs">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="font-heading text-base font-bold">Scan Volume Velocity</CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Aggregated interaction trajectory over the last 30 calendar days
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  Rolling 30 Days
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ScanTrendChart data={series} />
          </CardContent>
        </Card>
      </FadeIn>

      {/* Top Performing Codes Leaderboard */}
      <Card className="rounded-[24px] border border-border/80 shadow-2xs">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="size-4 text-amber-500" />
              <CardTitle className="font-heading text-base font-bold">Top Performing Campaigns</CardTitle>
            </div>
            <span className="text-xs text-muted-foreground">Ranked by scan volume</span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {topCodes.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No dynamic campaigns active yet.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {topCodes.map((code, index) => (
                <div
                  key={code.id}
                  className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <div className="flex size-9 items-center justify-center rounded-[10px] bg-primary/10 text-primary border border-primary/20">
                      <QrTypeIcon type={code.type as QrContentType} className="size-4" />
                    </div>
                    <div>
                      <Link
                        href={`/dashboard/qr/${code.id}`}
                        className="font-heading font-semibold text-xs sm:text-sm text-foreground hover:text-primary transition-colors hover:underline block"
                      >
                        {code.name}
                      </Link>
                      <p className="text-[11px] text-muted-foreground">
                        {QR_TYPE_META[code.type as QrContentType]?.label} • Created{" "}
                        {new Date(code.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-heading font-extrabold text-sm text-foreground tabular-nums">
                        {code._count.scanEvents.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">scans</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      render={<Link href={`/dashboard/qr/${code.id}`} />}
                      title="Inspect Campaign"
                    >
                      <ArrowUpRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audience Breakdown Grid */}
      <StaggerContainer immediate className="grid gap-6 sm:grid-cols-2">
        <StaggerItem>
          <Card className="rounded-[24px] border border-border/80 shadow-2xs">
            <CardHeader className="border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="size-4 text-primary" />
                <CardTitle className="font-heading text-sm font-bold">Client Operating Systems</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <BreakdownList
                title="Device Breakdown"
                items={devices.map((d) => ({ label: d.label, count: d.count }))}
              />
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="rounded-[24px] border border-border/80 shadow-2xs">
            <CardHeader className="border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-primary" />
                <CardTitle className="font-heading text-sm font-bold">Geographic Origin Breakdown</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <BreakdownList
                title="Country Telemetry"
                items={countries.map((c) => ({ label: c.label, count: c.count }))}
              />
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
