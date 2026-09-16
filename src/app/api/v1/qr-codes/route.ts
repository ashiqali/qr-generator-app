import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApiRequest } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { createQrCodeForOwner, PlanLimitError } from "@/lib/qr/service";
import { serializeQrCodeForApi } from "@/lib/qr/api-serialize";
import { qrContentPayloadSchema, qrDesignSchema } from "@/lib/validations/qr";
import { DEFAULT_DESIGN } from "@/lib/qr/types";
import type { Plan } from "@/lib/plans";

const createSchema = z.object({
  name: z.string().trim().min(1).max(100),
  payload: qrContentPayloadSchema,
  design: qrDesignSchema.partial().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const qrCodes = await prisma.qrCode.findMany({
    where: { ownerId: auth.user.id, archivedAt: null },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ data: qrCodes.map(serializeQrCodeForApi) });
}

export async function POST(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    const qr = await createQrCodeForOwner(auth.user.id, auth.user.plan as Plan, {
      name: parsed.data.name,
      type: parsed.data.payload.type,
      isDynamic: true,
      payload: parsed.data.payload,
      design: { ...DEFAULT_DESIGN, ...parsed.data.design },
    });
    return NextResponse.json({ data: serializeQrCodeForApi(qr) }, { status: 201 });
  } catch (error) {
    if (error instanceof PlanLimitError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }
}
