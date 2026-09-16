import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanTrendChart } from "@/components/scan-trend-chart";
import { BreakdownList } from "@/components/breakdown-list";
import { getScanTimeSeries, getDeviceBreakdown, getCountryBreakdown, getTotalScans } from "@/lib/qr/analytics";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";
import { AnimatedCounter } from "@/components/motion/animated-counter";
import { BarChart3, Globe, Smartphone, TrendingUp, Radio } from "lucide-react";

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const dynamicQrCodes = await prisma.qrCode.findMany({
    where: { ownerId: user.id, isDynamic: true },
    select: { id: true },
  });
  const ids = dynamicQrCodes.map((q) => q.id);

  const [series, devices, countries, totalScans] = await Promise.all([
    getScanTimeSeries(ids, 30),
    getDeviceBreakdown(ids),
    getCountryBreakdown(ids),
    getTotalScans(ids),
  ]);

  return (
    <div className="space-y-7">
      <FadeIn immediate y={10} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Campaign Analytics
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Aggregate telemetry and audience engagement across all your active dynamic QR codes.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time ingestion active</span>
        </div>
      </FadeIn>

      {/* KPI Overview */}
      <StaggerContainer immediate className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StaggerItem>
          <div className="card-sheen elevated-card rounded-2xl border border-border/80 bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Verified Scans</p>
                <div className="mt-2">
                  <AnimatedCounter value={totalScans} className="font-heading text-3xl font-bold tabular-nums tracking-tight text-foreground" />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Across 30 day window</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <BarChart3 className="size-5" />
              </div>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="card-sheen elevated-card rounded-2xl border border-border/80 bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Dynamic Deployments</p>
                <div className="mt-2">
                  <AnimatedCounter value={ids.length} className="font-heading text-3xl font-bold tabular-nums tracking-tight text-foreground" />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Active tracking codes</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Radio className="size-5" />
              </div>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="card-sheen elevated-card rounded-2xl border border-border/80 bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Audience Regions</p>
                <div className="mt-2">
                  <AnimatedCounter value={countries.length} className="font-heading text-3xl font-bold tabular-nums tracking-tight text-foreground" />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Geographic origins detected</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Globe className="size-5" />
              </div>
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Chart Section */}
      <FadeIn immediate delay={0.1}>
        <Card className="card-sheen rounded-2xl border border-border/80 shadow-xs">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-heading text-base font-bold">Scan Volume Velocity</CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">Daily interaction distribution over the last 30 days</p>
              </div>
              <span className="text-xs font-medium text-muted-foreground">Rolling 30 Days</span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ScanTrendChart data={series} />
          </CardContent>
        </Card>
      </FadeIn>

      {/* Audience Breakdown Sections */}
      <StaggerContainer immediate className="grid gap-6 sm:grid-cols-2">
        <StaggerItem>
          <Card className="card-sheen rounded-2xl border border-border/80 shadow-xs">
            <CardHeader className="border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="size-4 text-primary" />
                <CardTitle className="font-heading text-sm font-semibold">Device Distribution</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <BreakdownList title="Client Operating Systems" items={devices.map((d) => ({ label: d.label, count: d.count }))} />
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="card-sheen rounded-2xl border border-border/80 shadow-xs">
            <CardHeader className="border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-primary" />
                <CardTitle className="font-heading text-sm font-semibold">Geographic Spread</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <BreakdownList
                title="Top Origin Countries"
                items={countries.map((c) => ({ label: c.label, count: c.count }))}
                emptyLabel="No location data recorded yet"
              />
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
