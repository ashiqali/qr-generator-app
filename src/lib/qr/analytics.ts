import "server-only";
import { format, subDays } from "date-fns";
import { prisma } from "@/lib/prisma";

export async function getScanTimeSeries(qrCodeIds: string[], days = 30) {
  const since = subDays(new Date(), days - 1);
  const events =
    qrCodeIds.length === 0
      ? []
      : await prisma.scanEvent.findMany({
          where: { qrCodeId: { in: qrCodeIds }, timestamp: { gte: since } },
          select: { timestamp: true },
        });

  const buckets = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    buckets.set(format(subDays(new Date(), i), "yyyy-MM-dd"), 0);
  }
  for (const event of events) {
    const day = format(event.timestamp, "yyyy-MM-dd");
    if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1);
  }

  return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
}

export async function getDeviceBreakdown(qrCodeIds: string[]) {
  if (qrCodeIds.length === 0) return [];
  const grouped = await prisma.scanEvent.groupBy({
    by: ["deviceType"],
    where: { qrCodeId: { in: qrCodeIds } },
    _count: true,
  });
  return grouped
    .map((g) => ({ label: g.deviceType ?? "Unknown", count: g._count }))
    .sort((a, b) => b.count - a.count);
}

export async function getCountryBreakdown(qrCodeIds: string[]) {
  if (qrCodeIds.length === 0) return [];
  const grouped = await prisma.scanEvent.groupBy({
    by: ["country"],
    where: { qrCodeId: { in: qrCodeIds } },
    _count: true,
  });
  return grouped
    .map((g) => ({ label: g.country ?? "Unknown", count: g._count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export async function getTotalScans(qrCodeIds: string[]) {
  if (qrCodeIds.length === 0) return 0;
  return prisma.scanEvent.count({ where: { qrCodeId: { in: qrCodeIds } } });
}
