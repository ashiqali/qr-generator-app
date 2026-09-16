import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Download, ArrowLeft, ExternalLink, QrCode as QrIcon } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { ScanTrendChart } from "@/components/scan-trend-chart";
import { BreakdownList } from "@/components/breakdown-list";
import { getScanTimeSeries, getDeviceBreakdown, getCountryBreakdown } from "@/lib/qr/analytics";
import { QR_TYPE_META, QrTypeIcon } from "../qr-type-icon";
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
              <Badge variant={qr.isDynamic ? "default" : "secondary"} className="h-6 px-2.5">
                {qr.isDynamic ? (
                  <span className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Dynamic
                  </span>
                ) : (
                  "Static"
                )}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{typeMeta?.label}</span>
              <span>•</span>
              <span>Created {new Date(qr.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button render={<Link href={`/dashboard/qr/${qr.id}/edit`} />} size="sm" variant="outline" className="h-9 px-3.5">
              <Pencil className="mr-1.5 size-3.5" /> Edit
            </Button>
            <QrDetailActions id={qr.id} />
          </div>
        </div>
      </FadeIn>

      <StaggerContainer immediate className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Left Column: QR Asset Card */}
        <StaggerItem>
          <Card className="card-sheen elevated-card rounded-2xl border border-border/80 shadow-xs">
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="font-heading text-sm font-semibold">Production Asset</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 pt-5">
              <div className="relative flex aspect-square w-full items-center justify-center rounded-xl border border-border/80 bg-white p-4 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/qr/${qr.id}/export?format=png`}
                  alt={qr.name}
                  className="size-full object-contain"
                />
              </div>

              {shortUrl && (
                <div className="w-full space-y-1.5 rounded-xl border border-border/80 bg-muted/40 p-3 text-center">
                  <p className="truncate text-xs text-muted-foreground font-mono">{shortUrl}</p>
                  <CopyButton value={shortUrl} label="Copy short link" />
                </div>
              )}

              <div className="w-full space-y-2">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Download Formats
                </p>
                <div className="grid w-full grid-cols-3 gap-2">
                  <Button render={<a href={`/api/qr/${qr.id}/export?format=png`} download />} size="sm" variant="outline" className="h-8 text-xs font-semibold">
                    <Download className="mr-1 size-3" /> PNG
                  </Button>
                  <Button render={<a href={`/api/qr/${qr.id}/export?format=svg`} download />} size="sm" variant="outline" className="h-8 text-xs font-semibold">
                    <Download className="mr-1 size-3" /> SVG
                  </Button>
                  <Button render={<a href={`/api/qr/${qr.id}/export?format=pdf`} download />} size="sm" variant="outline" className="h-8 text-xs font-semibold">
                    <Download className="mr-1 size-3" /> PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Right Column: Performance & Telemetry */}
        <StaggerItem className="space-y-6">
          <Card className="card-sheen rounded-2xl border border-border/80 shadow-xs">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="font-heading text-base font-bold">
                {qr.isDynamic ? "Scan Velocity (Last 30 Days)" : "Analytics"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {qr.isDynamic ? (
                <ScanTrendChart data={series} />
              ) : (
                <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-6 text-center">
                  <p className="text-sm font-semibold text-foreground">Analytics Unavailable for Static Codes</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Static QR codes encode data directly into the pixel matrix. Convert this code to
                    Dynamic in Edit mode to route through our telemetry engine.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {qr.isDynamic && (
            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="card-sheen rounded-2xl border border-border/80 shadow-xs">
                <CardContent className="pt-6">
                  <BreakdownList title="Top Devices" items={devices.map((d) => ({ label: d.label, count: d.count }))} />
                </CardContent>
              </Card>
              <Card className="card-sheen rounded-2xl border border-border/80 shadow-xs">
                <CardContent className="pt-6">
                  <BreakdownList
                    title="Top Countries"
                    items={countries.map((c) => ({ label: c.label, count: c.count }))}
                    emptyLabel="No location events recorded yet"
                  />
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="rounded-xl border border-border/70 bg-card/60">
            <CardContent className="pt-5 pb-5 text-sm text-muted-foreground flex items-center justify-between">
              <span>Verified lifetime events</span>
              <span className="font-medium text-foreground">
                Total scans: {qr._count.scanEvents}
              </span>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
