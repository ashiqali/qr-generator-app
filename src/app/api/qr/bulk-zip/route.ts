import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { parseQrCode } from "@/lib/qr/service";
import { generateQrSvg } from "@/lib/qr/generate";
import { svgToPngBuffer } from "@/lib/qr/export";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const idsParam = request.nextUrl.searchParams.get("ids") ?? "";
  const ids = idsParam.split(",").map((id) => id.trim()).filter(Boolean).slice(0, 500);
  if (ids.length === 0) return NextResponse.json({ error: "No ids provided" }, { status: 400 });

  const qrCodes = await prisma.qrCode.findMany({ where: { id: { in: ids }, ownerId: user.id } });

  const zip = new JSZip();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const usedNames = new Set<string>();

  for (const qr of qrCodes) {
    const { payload, design } = parseQrCode(qr);
    const svg = generateQrSvg({
      isDynamic: qr.isDynamic,
      shortCode: qr.shortCode,
      payload,
      design,
      appUrl,
      moduleSizePx: 16,
    });
    const png = await svgToPngBuffer(svg, 1024);

    let filename = `${qr.name.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase() || "qr-code"}.png`;
    let suffix = 2;
    while (usedNames.has(filename)) {
      filename = `${filename.replace(/\.png$/, "")}-${suffix}.png`;
      suffix++;
    }
    usedNames.add(filename);

    zip.file(filename, png);
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

  return new NextResponse(new Blob([new Uint8Array(zipBuffer)]), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="qr-codes.zip"`,
    },
  });
}
