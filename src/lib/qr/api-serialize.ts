import "server-only";
import type { QrCode } from "@prisma/client";
import { parseQrCode } from "./service";

export function serializeQrCodeForApi(qr: QrCode) {
  const { payload, design } = parseQrCode(qr);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    id: qr.id,
    name: qr.name,
    type: qr.type,
    isDynamic: qr.isDynamic,
    shortUrl: qr.shortCode ? `${appUrl}/r/${qr.shortCode}` : null,
    payload,
    design,
    createdAt: qr.createdAt,
    updatedAt: qr.updatedAt,
  };
}
