import { prisma } from "@/lib/prisma";
import { PLANS, getCurrentPeriod, type Plan } from "@/lib/plans";

export async function getOrCreateUsageCounter(ownerId: string, period = getCurrentPeriod()) {
  return prisma.usageCounter.upsert({
    where: { ownerId_period: { ownerId, period } },
    update: {},
    create: { ownerId, period },
  });
}

export async function incrementUsage(
  ownerId: string,
  field: "dynamicQrCount" | "scanCount" | "apiCallCount",
  amount = 1,
  period = getCurrentPeriod(),
) {
  await prisma.usageCounter.upsert({
    where: { ownerId_period: { ownerId, period } },
    update: { [field]: { increment: amount } },
    create: { ownerId, period, [field]: amount },
  });
}

export type QrCreationCheck =
  | { allowed: true }
  | { allowed: false; reason: string };

/** Checks plan limits before creating a new QR code. Does not mutate state. */
export async function canCreateQrCode(
  ownerId: string,
  plan: Plan,
  isDynamic: boolean,
): Promise<QrCreationCheck> {
  const limits = PLANS[plan];

  const totalQrCodes = await prisma.qrCode.count({
    where: { ownerId, archivedAt: null },
  });
  if (totalQrCodes >= limits.maxQrCodes) {
    return {
      allowed: false,
      reason: `Your ${limits.name} plan allows up to ${limits.maxQrCodes} QR codes. Upgrade to create more.`,
    };
  }

  if (isDynamic) {
    const dynamicQrCodes = await prisma.qrCode.count({
      where: { ownerId, isDynamic: true, archivedAt: null },
    });
    if (dynamicQrCodes >= limits.maxDynamicQrCodes) {
      return {
        allowed: false,
        reason: `Your ${limits.name} plan allows up to ${limits.maxDynamicQrCodes} dynamic QR code(s). Upgrade for unlimited dynamic codes.`,
      };
    }
  }

  return { allowed: true };
}

export function canUseCustomBranding(plan: Plan): boolean {
  return PLANS[plan].customBranding;
}

export function canUseBulkGeneration(plan: Plan): boolean {
  return PLANS[plan].bulkGeneration;
}

export function canUseApi(plan: Plan): boolean {
  return PLANS[plan].apiAccess;
}

export async function canCreateApiKey(ownerId: string, plan: Plan): Promise<QrCreationCheck> {
  const limits = PLANS[plan];
  if (!limits.apiAccess) {
    return { allowed: false, reason: "API access requires the Business plan." };
  }
  const existing = await prisma.apiKey.count({ where: { ownerId, revokedAt: null } });
  if (existing >= limits.maxApiKeys) {
    return {
      allowed: false,
      reason: `Your ${limits.name} plan allows up to ${limits.maxApiKeys} active API keys.`,
    };
  }
  return { allowed: true };
}
