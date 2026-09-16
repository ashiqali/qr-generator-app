import "server-only";
import { findOwnerByApiKey } from "@/lib/api-keys";
import { canUseApi, incrementUsage } from "@/lib/plan-limits";
import type { Plan } from "@/lib/plans";
import type { User } from "@prisma/client";

export type ApiAuthResult = { user: User } | { error: string; status: number };

export async function authenticateApiRequest(request: Request): Promise<ApiAuthResult> {
  const authHeader = request.headers.get("authorization");
  const rawKey = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!rawKey) return { error: "Missing API key", status: 401 };

  const user = await findOwnerByApiKey(rawKey);
  if (!user) return { error: "Invalid API key", status: 401 };

  if (!canUseApi(user.plan as Plan)) {
    return { error: "API access requires the Business plan", status: 403 };
  }

  await incrementUsage(user.id, "apiCallCount");
  return { user };
}
