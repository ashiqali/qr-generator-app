import Link from "next/link";
import { Plus, QrCode as QrCodeIcon, Radio, ScanLine } from "lucide-react";
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
    plan.maxQrCodes === Infinity ? "Unlimited QR codes" : `${qrCodes.length} / ${plan.maxQrCodes} QR codes used`;

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
    <div className="space-y-6">
      <FadeIn immediate y={10} className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">QR Codes</h1>
          <p className="text-sm text-muted-foreground">
            {limitLabel} on the {plan.name} plan
          </p>
        </div>
        <Button render={<Link href="/dashboard/qr/new" />}>
          <Plus className="mr-2 size-4" /> Create QR code
        </Button>
      </FadeIn>

      {rows.length > 0 && (
        <StaggerContainer immediate className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StaggerItem>
            <StatCard icon={QrCodeIcon} label="Total QR codes" value={qrCodes.length} />
          </StaggerItem>
          <StaggerItem>
            <StatCard icon={Radio} label="Dynamic codes" value={dynamicCount} />
          </StaggerItem>
          <StaggerItem>
            <StatCard icon={ScanLine} label="Total scans" value={totalScans} />
          </StaggerItem>
        </StaggerContainer>
      )}

      {rows.length === 0 ? <EmptyState /> : <QrCodeTable qrCodes={rows} />}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof QrCodeIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <AnimatedCounter value={value} className="text-2xl font-semibold tabular-nums" />
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
