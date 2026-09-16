"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/session";
import { createQrCodeForOwner, PlanLimitError } from "@/lib/qr/service";
import { canUseBulkGeneration } from "@/lib/plan-limits";
import { DEFAULT_DESIGN } from "@/lib/qr/types";
import type { Plan } from "@/lib/plans";
import type { BulkCsvRow } from "@/lib/csv";

export type BulkGenerateResult =
  | { error: string }
  | { success: true; created: { id: string; name: string }[]; skipped: { name: string; reason: string }[] };

export async function bulkGenerateAction(rows: BulkCsvRow[]): Promise<BulkGenerateResult> {
  const user = await requireCurrentUser();
  const plan = user.plan as Plan;

  if (!canUseBulkGeneration(plan)) {
    return { error: "Bulk generation requires the Pro plan or higher." };
  }
  if (rows.length === 0) {
    return { error: "No valid rows found in the CSV." };
  }
  if (rows.length > 500) {
    return { error: "Bulk uploads are limited to 500 rows at a time." };
  }

  const created: { id: string; name: string }[] = [];
  const skipped: { name: string; reason: string }[] = [];

  for (const row of rows) {
    let url: URL;
    try {
      url = new URL(row.url);
    } catch {
      skipped.push({ name: row.name, reason: "Invalid URL" });
      continue;
    }
    try {
      const qr = await createQrCodeForOwner(user.id, plan, {
        name: row.name,
        type: "URL",
        isDynamic: true,
        payload: { type: "URL", url: url.toString() },
        design: DEFAULT_DESIGN,
      });
      created.push({ id: qr.id, name: qr.name });
    } catch (error) {
      if (error instanceof PlanLimitError) {
        skipped.push({ name: row.name, reason: error.message });
        break; // further rows will hit the same limit
      }
      throw error;
    }
  }

  revalidatePath("/dashboard");
  return { success: true, created, skipped };
}
