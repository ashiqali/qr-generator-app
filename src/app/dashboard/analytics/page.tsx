import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanTrendChart } from "@/components/scan-trend-chart";
import { BreakdownList } from "@/components/breakdown-list";
import { getScanTimeSeries, getDeviceBreakdown, getCountryBreakdown, getTotalScans } from "@/lib/qr/analytics";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";
import { AnimatedCounter } from "@/components/motion/animated-counter";

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
    <div className="space-y-6">
      <FadeIn immediate y={10}>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Aggregate scan activity across all your dynamic QR codes.</p>
      </FadeIn>

      <FadeIn immediate delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scans over the last 30 days</CardTitle>
          </CardHeader>
          <CardContent>
            <ScanTrendChart data={series} />
          </CardContent>
        </Card>
      </FadeIn>

      <StaggerContainer immediate className="grid gap-6 sm:grid-cols-3">
        <StaggerItem>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total scans</p>
              <AnimatedCounter value={totalScans} className="text-3xl font-semibold" />
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardContent className="pt-6">
              <BreakdownList title="Devices" items={devices.map((d) => ({ label: d.label, count: d.count }))} />
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardContent className="pt-6">
              <BreakdownList
                title="Countries"
                items={countries.map((c) => ({ label: c.label, count: c.count }))}
                emptyLabel="No location data yet"
              />
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
