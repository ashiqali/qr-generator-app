import "server-only";
import { prisma } from "@/lib/prisma";
import { canCreateQrCode, incrementUsage } from "@/lib/plan-limits";
import type { Plan } from "@/lib/plans";
import { generateShortCode } from "./shortcode";
import type { QrContentPayload, QrDesign } from "./types";
import type { QrCode } from "@prisma/client";

export class PlanLimitError extends Error {}
export class NotFoundError extends Error {}

async function generateUniqueShortCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateShortCode();
    const existing = await prisma.qrCode.findUnique({ where: { shortCode: code } });
    if (!existing) return code;
  }
  throw new Error("Could not generate a unique short code, please retry.");
}

export interface QrInput {
  name: string;
  type: QrContentPayload["type"];
  isDynamic: boolean;
  payload: QrContentPayload;
  design: QrDesign;
}

export async function createQrCodeForOwner(ownerId: string, plan: Plan, input: QrInput) {
  const check = await canCreateQrCode(ownerId, plan, input.isDynamic);
  if (!check.allowed) throw new PlanLimitError(check.reason);

  const shortCode = input.isDynamic ? await generateUniqueShortCode() : null;

  const qr = await prisma.qrCode.create({
    data: {
      ownerId,
      name: input.name,
      type: input.type,
      isDynamic: input.isDynamic,
      shortCode,
      targetPayload: JSON.stringify(input.payload),
      design: JSON.stringify(input.design),
    },
  });

  if (input.isDynamic) await incrementUsage(ownerId, "dynamicQrCount");

  return qr;
}

export async function updateQrCodeForOwner(id: string, ownerId: string, input: QrInput) {
  const existing = await prisma.qrCode.findFirst({ where: { id, ownerId } });
  if (!existing) throw new NotFoundError("QR code not found.");

  // A code can be upgraded from static -> dynamic, but never demoted back:
  // going dynamic->static would silently break a code that's already printed
  // (it currently encodes the /r/[shortCode] redirect URL).
  const isDynamic = existing.isDynamic || input.isDynamic;
  let shortCode = existing.shortCode;

  if (isDynamic && !shortCode) {
    const plan = ((await prisma.user.findUnique({ where: { id: ownerId } }))?.plan ?? "FREE") as Plan;
    if (!existing.isDynamic) {
      const check = await canCreateQrCode(ownerId, plan, true);
      if (!check.allowed) throw new PlanLimitError(check.reason);
      await incrementUsage(ownerId, "dynamicQrCount");
    }
    shortCode = await generateUniqueShortCode();
  }

  return prisma.qrCode.update({
    where: { id },
    data: {
      name: input.name,
      isDynamic,
      shortCode,
      targetPayload: JSON.stringify(input.payload),
      design: JSON.stringify(input.design),
    },
  });
}

export async function archiveQrCodeForOwner(id: string, ownerId: string) {
  const existing = await prisma.qrCode.findFirst({ where: { id, ownerId } });
  if (!existing) throw new NotFoundError("QR code not found.");
  return prisma.qrCode.update({ where: { id }, data: { archivedAt: new Date() } });
}

export async function restoreQrCodeForOwner(id: string, ownerId: string) {
  const existing = await prisma.qrCode.findFirst({ where: { id, ownerId } });
  if (!existing) throw new NotFoundError("QR code not found.");
  return prisma.qrCode.update({ where: { id }, data: { archivedAt: null } });
}

export async function deleteQrCodeForOwner(id: string, ownerId: string) {
  const existing = await prisma.qrCode.findFirst({ where: { id, ownerId } });
  if (!existing) throw new NotFoundError("QR code not found.");
  return prisma.qrCode.delete({ where: { id } });
}

export function parseQrCode(qr: QrCode) {
  return {
    ...qr,
    payload: JSON.parse(qr.targetPayload) as QrContentPayload,
    design: JSON.parse(qr.design) as QrDesign,
  };
}
