import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Download, ArrowLeft } from "lucide-react";
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
      {/* Header & Back link */}
      <FadeIn immediate y={10} className="space-y-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to all QR codes
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {qr.name}
              </h1>
              <Badge variant={qr.isDynamic ? "default" : "secondary"} className="h-6 px-2.5 rounded-full">
                {qr.isDynamic ? (
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Dynamic
                  </span>
                ) : (
                  "Static"
                )}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{typeMeta?.label}</span>
              <span>•</span>
              <span>Created {new Date(qr.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              render={<Link href={`/dashboard/qr/${qr.id}/edit`} />}
              size="sm"
              variant="outline"
              className="h-9 px-3.5 rounded-[12px] text-xs font-semibold"
            >
              <Pencil className="mr-1.5 size-3.5" /> Edit Destination
            </Button>
            <QrDetailActions id={qr.id} />
          </div>
        </div>
      </FadeIn>

      <StaggerContainer immediate className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left Column: QR Asset Card */}
        <StaggerItem>
          <Card className="rounded-[24px] border border-border/80 shadow-2xs">
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="font-heading text-sm font-bold">Production Vector Asset</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 pt-5">
              <div className="relative flex aspect-square w-full items-center justify-center rounded-[20px] border border-border/80 bg-white p-5 shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/qr/${qr.id}/export?format=png`}
                  alt={qr.name}
                  className="size-full object-contain"
                />
              </div>

              {shortUrl && (
                <div className="w-full space-y-1.5 rounded-[16px] border border-border/80 bg-muted/40 p-3 text-center">
                  <p className="truncate text-xs text-muted-foreground font-mono">{shortUrl}</p>
                  <CopyButton value={shortUrl} label="Copy dynamic short-link" />
                </div>
              )}

              <div className="w-full space-y-2 pt-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Download Ready Formats
                </p>
                <div className="grid w-full grid-cols-3 gap-2">
                  <Button
                    render={<a href={`/api/qr/${qr.id}/export?format=png`} download />}
                    size="sm"
                    variant="outline"
                    className="h-8.5 text-xs font-semibold rounded-[10px]"
                  >
                    <Download className="mr-1 size-3" /> PNG
                  </Button>
                  <Button
                    render={<a href={`/api/qr/${qr.id}/export?format=svg`} download />}
                    size="sm"
                    variant="outline"
                    className="h-8.5 text-xs font-semibold rounded-[10px]"
                  >
                    <Download className="mr-1 size-3" /> SVG
                  </Button>
                  <Button
                    render={<a href={`/api/qr/${qr.id}/export?format=pdf`} download />}
                    size="sm"
                    variant="outline"
                    className="h-8.5 text-xs font-semibold rounded-[10px]"
                  >
                    <Download className="mr-1 size-3" /> PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Right Column: Performance & Telemetry */}
        <StaggerItem className="space-y-6">
          <Card className="rounded-[24px] border border-border/80 shadow-2xs">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading text-base font-bold">
                  {qr.isDynamic ? "Scan Velocity (Last 30 Days)" : "Static QR Code"}
                </CardTitle>
                {qr.isDynamic && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {qr._count.scanEvents.toLocaleString()} Scans
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              {qr.isDynamic ? (
                <ScanTrendChart data={series} />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground text-xs">No scan analytics for static codes</p>
                  <p className="max-w-md text-xs">
                    Static codes encode data directly into the pixel pattern. Convert to a dynamic QR code anytime to track scans and edit destinations.
                  </p>
                  <Button
                    render={<Link href="/dashboard/billing" />}
                    size="sm"
                    variant="outline"
                    className="mt-3 rounded-[12px] text-xs font-semibold"
                  >
                    Upgrade for Dynamic Analytics
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {qr.isDynamic && (
            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="rounded-[24px] border border-border/80 shadow-2xs">
                <CardContent className="pt-5">
                  <BreakdownList title="Device Types" items={devices} />
                </CardContent>
              </Card>
              <Card className="rounded-[24px] border border-border/80 shadow-2xs">
                <CardContent className="pt-5">
                  <BreakdownList title="Top Countries" items={countries} />
                </CardContent>
              </Card>
            </div>
          )}
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
