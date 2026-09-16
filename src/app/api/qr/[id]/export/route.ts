import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { parseQrCode } from "@/lib/qr/service";
import { generateQrSvg } from "@/lib/qr/generate";
import { svgToPdfBuffer, svgToPngBuffer } from "@/lib/qr/export";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const qr = await prisma.qrCode.findFirst({ where: { id, ownerId: user.id } });
  if (!qr) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const format = request.nextUrl.searchParams.get("format") ?? "png";
  const { payload, design } = parseQrCode(qr);
  const svg = generateQrSvg({
    isDynamic: qr.isDynamic,
    shortCode: qr.shortCode,
    payload,
    design,
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    moduleSizePx: 16,
  });

  const filename = qr.name.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase() || "qr-code";

  if (format === "svg") {
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="${filename}.svg"`,
      },
    });
  }

  if (format === "pdf") {
    const pdf = await svgToPdfBuffer(svg);
    return new NextResponse(new Blob([new Uint8Array(pdf)]), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
      },
    });
  }

  const png = await svgToPngBuffer(svg, 1024);
  return new NextResponse(new Blob([new Uint8Array(png)]), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${filename}.png"`,
    },
  });
}
