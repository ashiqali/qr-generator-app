import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { parseQrCode } from "@/lib/qr/service";
import { logScanEvent } from "@/lib/qr/scan-log";
import { resolveAppLinkTarget } from "@/lib/qr/encoders";
import { ScanLanding } from "./scan-landing";

export default async function RedirectPage({ params }: { params: Promise<{ shortCode: string }> }) {
  const { shortCode } = await params;

  const qr = await prisma.qrCode.findUnique({ where: { shortCode } });
  if (!qr || qr.archivedAt) notFound();

  const headersList = await headers();
  await logScanEvent(qr.id, qr.ownerId, headersList);

  const { payload, name } = { ...parseQrCode(qr), name: qr.name };

  if (payload.type === "URL") redirect(payload.url);
  if (payload.type === "PDF") redirect(payload.fileUrl);
  if (payload.type === "APP_LINK") {
    redirect(resolveAppLinkTarget(payload, headersList.get("user-agent") ?? ""));
  }

  return <ScanLanding name={name} payload={payload} />;
}
