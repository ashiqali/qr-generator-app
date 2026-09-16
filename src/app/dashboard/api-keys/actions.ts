"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/session";
import { canCreateApiKey } from "@/lib/plan-limits";
import { generateApiKey, hashApiKey } from "@/lib/api-keys";
import { prisma } from "@/lib/prisma";
import type { Plan } from "@/lib/plans";

export type CreateApiKeyResult = { error: string } | { success: true; rawKey: string };

export async function createApiKeyAction(label: string): Promise<CreateApiKeyResult> {
  const user = await requireCurrentUser();
  const check = await canCreateApiKey(user.id, user.plan as Plan);
  if (!check.allowed) return { error: check.reason };
  if (!label.trim()) return { error: "Label is required." };

  const { rawKey, prefix } = generateApiKey();
  await prisma.apiKey.create({
    data: { ownerId: user.id, label: label.trim(), hashedKey: hashApiKey(rawKey), keyPrefix: prefix },
  });
  revalidatePath("/dashboard/api-keys");
  return { success: true, rawKey };
}

export async function revokeApiKeyAction(id: string) {
  const user = await requireCurrentUser();
  await prisma.apiKey.updateMany({ where: { id, ownerId: user.id }, data: { revokedAt: new Date() } });
  revalidatePath("/dashboard/api-keys");
}
