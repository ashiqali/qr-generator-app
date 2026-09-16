import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApiRequest } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { serializeQrCodeForApi } from "@/lib/qr/api-serialize";
import { qrContentPayloadSchema } from "@/lib/validations/qr";

const updateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  payload: qrContentPayloadSchema.optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(request);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const qr = await prisma.qrCode.findFirst({ where: { id, ownerId: auth.user.id } });
  if (!qr) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data: serializeQrCodeForApi(qr) });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(request);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const existing = await prisma.qrCode.findFirst({ where: { id, ownerId: auth.user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  if (parsed.data.payload && parsed.data.payload.type !== existing.type) {
    return NextResponse.json({ error: "Cannot change a QR code's content type" }, { status: 400 });
  }

  const qr = await prisma.qrCode.update({
    where: { id },
    data: {
      name: parsed.data.name ?? existing.name,
      targetPayload: parsed.data.payload ? JSON.stringify(parsed.data.payload) : existing.targetPayload,
    },
  });

  return NextResponse.json({ data: serializeQrCodeForApi(qr) });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(request);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const existing = await prisma.qrCode.findFirst({ where: { id, ownerId: auth.user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.qrCode.delete({ where: { id } });
  return NextResponse.json({ data: { deleted: true } });
}
