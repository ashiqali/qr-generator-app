import "server-only";
import { UAParser } from "ua-parser-js";
import { prisma } from "@/lib/prisma";
import { incrementUsage } from "@/lib/plan-limits";

export async function logScanEvent(qrCodeId: string, ownerId: string, requestHeaders: Headers) {
  const userAgent = requestHeaders.get("user-agent") ?? "";
  const referrer = requestHeaders.get("referer");
  const country =
    requestHeaders.get("x-vercel-ip-country") ?? requestHeaders.get("cf-ipcountry") ?? null;

  const parsed = new UAParser(userAgent).getResult();
  const deviceType = parsed.device.type ?? "desktop";

  await prisma.scanEvent.create({
    data: {
      qrCodeId,
      country,
      deviceType,
      os: parsed.os.name,
      browser: parsed.browser.name,
      referrer,
    },
  });

  await incrementUsage(ownerId, "scanCount");
}
