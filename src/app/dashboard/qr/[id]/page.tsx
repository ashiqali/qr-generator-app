import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Download } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { ScanTrendChart } from "@/components/scan-trend-chart";
import { BreakdownList } from "@/components/breakdown-list";
import { getScanTimeSeries, getDeviceBreakdown, getCountryBreakdown } from "@/lib/qr/analytics";
import { QR_TYPE_META } from "../qr-type-icon";
import { QrDetailActions } from "./qr-detail-actions";
import type { QrContentType } from "@/lib/qr/types";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";

export default async function QrDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const qr = await prisma.qrCode.findFirst({
    where: { id, ownerId: user.id },
    include: { _count: { select: { scanEvents: true } } },
  });
  if (!qr) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const shortUrl = qr.shortCode ? `${appUrl}/r/${qr.shortCode}` : null;
  const typeMeta = QR_TYPE_META[qr.type as QrContentType];

  const [series, devices, countries] = qr.isDynamic
    ? await Promise.all([
        getScanTimeSeries([qr.id], 30),
        getDeviceBreakdown([qr.id]),
        getCountryBreakdown([qr.id]),
      ])
    : [[], [], []];

  return (
    <div className="space-y-6">
      <FadeIn immediate y={10} className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{qr.name}</h1>
            <Badge variant={qr.isDynamic ? "default" : "secondary"}>{qr.isDynamic ? "Dynamic" : "Static"}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{typeMeta?.label}</p>
        </div>
        <div className="flex gap-2">
          <Button render={<Link href={`/dashboard/qr/${qr.id}/edit`} />} size="sm" variant="outline">
            <Pencil className="mr-1.5 size-3.5" /> Edit
          </Button>
          <QrDetailActions id={qr.id} />
        </div>
      </FadeIn>

      <StaggerContainer immediate className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <StaggerItem>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/qr/${qr.id}/export?format=png`}
              alt={qr.name}
              className="w-full max-w-56 rounded border bg-white p-2"
            />
            {shortUrl && (
              <div className="w-full space-y-1 text-center">
                <p className="truncate text-xs text-muted-foreground">{shortUrl}</p>
                <CopyButton value={shortUrl} label="Copy link" />
              </div>
            )}
            <div className="grid w-full grid-cols-3 gap-2">
              <Button render={<a href={`/api/qr/${qr.id}/export?format=png`} download />} size="sm" variant="outline">
                <Download className="mr-1 size-3.5" /> PNG
              </Button>
              <Button render={<a href={`/api/qr/${qr.id}/export?format=svg`} download />} size="sm" variant="outline">
                <Download className="mr-1 size-3.5" /> SVG
              </Button>
              <Button render={<a href={`/api/qr/${qr.id}/export?format=pdf`} download />} size="sm" variant="outline">
                <Download className="mr-1 size-3.5" /> PDF
              </Button>
            </div>
          </CardContent>
        </Card>
        </StaggerItem>

        <StaggerItem className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {qr.isDynamic ? "Scans over the last 30 days" : "Analytics"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {qr.isDynamic ? (
                <ScanTrendChart data={series} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Static QR codes encode their content directly, so scans aren&apos;t tracked. Make this
                  code dynamic (via Edit) to unlock analytics.
                </p>
              )}
            </CardContent>
          </Card>

          {qr.isDynamic && (
            <div className="grid gap-6 sm:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <BreakdownList title="Devices" items={devices.map((d) => ({ label: d.label, count: d.count }))} />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <BreakdownList
                    title="Countries"
                    items={countries.map((c) => ({ label: c.label, count: c.count }))}
                    emptyLabel="No location data yet"
                  />
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Total scans: <span className="font-medium text-foreground">{qr._count.scanEvents}</span>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
