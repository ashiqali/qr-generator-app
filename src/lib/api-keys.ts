import "server-only";
import crypto from "node:crypto";
import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/prisma";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const generateKeySuffix = customAlphabet(ALPHABET, 32);

export function hashApiKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

export function generateApiKey(): { rawKey: string; prefix: string } {
  const rawKey = `qr_live_${generateKeySuffix()}`;
  return { rawKey, prefix: rawKey.slice(0, 12) };
}

export async function findOwnerByApiKey(rawKey: string) {
  const hashedKey = hashApiKey(rawKey);
  const apiKey = await prisma.apiKey.findUnique({ where: { hashedKey } });
  if (!apiKey || apiKey.revokedAt) return null;

  await prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } });
  return prisma.user.findUnique({ where: { id: apiKey.ownerId } });
}
