import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateQrSvg } from "@/lib/qr/generate";
import { upsertQrSchema } from "@/lib/validations/qr";

const previewSchema = upsertQrSchema.pick({ payload: true, design: true, isDynamic: true });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = previewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const svg = generateQrSvg({
    isDynamic: parsed.data.isDynamic,
    shortCode: "PREVIEW",
    payload: parsed.data.payload,
    design: parsed.data.design,
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  });

  return new NextResponse(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
  });
}
