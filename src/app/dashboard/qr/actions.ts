"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/session";
import { upsertQrSchema, type UpsertQrInput } from "@/lib/validations/qr";
import {
  archiveQrCodeForOwner,
  createQrCodeForOwner,
  deleteQrCodeForOwner,
  NotFoundError,
  PlanLimitError,
  restoreQrCodeForOwner,
  updateQrCodeForOwner,
} from "@/lib/qr/service";
import { DYNAMIC_ONLY_TYPES } from "@/lib/qr/types";
import type { Plan } from "@/lib/plans";

export type QrActionResult = { error: string } | { success: true; id: string };

export async function createQrAction(input: UpsertQrInput): Promise<QrActionResult> {
  const user = await requireCurrentUser();
  const parsed = upsertQrSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const isDynamic = parsed.data.isDynamic || DYNAMIC_ONLY_TYPES.includes(parsed.data.payload.type);

  try {
    const qr = await createQrCodeForOwner(user.id, user.plan as Plan, {
      name: parsed.data.name,
      type: parsed.data.payload.type,
      isDynamic,
      payload: parsed.data.payload,
      design: parsed.data.design,
    });
    revalidatePath("/dashboard");
    return { success: true, id: qr.id };
  } catch (error) {
    if (error instanceof PlanLimitError) return { error: error.message };
    throw error;
  }
}

export async function updateQrAction(id: string, input: UpsertQrInput): Promise<QrActionResult> {
  const user = await requireCurrentUser();
  const parsed = upsertQrSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const isDynamic = parsed.data.isDynamic || DYNAMIC_ONLY_TYPES.includes(parsed.data.payload.type);

  try {
    await updateQrCodeForOwner(id, user.id, {
      name: parsed.data.name,
      type: parsed.data.payload.type,
      isDynamic,
      payload: parsed.data.payload,
      design: parsed.data.design,
    });
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/qr/${id}`);
    return { success: true, id };
  } catch (error) {
    if (error instanceof PlanLimitError || error instanceof NotFoundError) {
      return { error: error.message };
    }
    throw error;
  }
}

export async function archiveQrAction(id: string) {
  const user = await requireCurrentUser();
  await archiveQrCodeForOwner(id, user.id);
  revalidatePath("/dashboard");
}

export async function restoreQrAction(id: string) {
  const user = await requireCurrentUser();
  await restoreQrCodeForOwner(id, user.id);
  revalidatePath("/dashboard");
}

export async function deleteQrAction(id: string) {
  const user = await requireCurrentUser();
  await deleteQrCodeForOwner(id, user.id);
  revalidatePath("/dashboard");
}
