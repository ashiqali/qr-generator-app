import type { QrContentPayload } from "./types";

function escapeWifiField(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

function vcardLine(label: string, value?: string): string {
  return value ? `${label}:${value}\n` : "";
}

/**
 * Builds the literal string baked into a *static* QR code for content types
 * that support it. Dynamic QR codes never call this for the printed image —
 * they always encode the /r/[shortCode] redirect URL instead, and this
 * function is reused only to render the live preview / scan-time landing page.
 */
export function encodeContentPayload(payload: QrContentPayload): string {
  switch (payload.type) {
    case "URL":
      return payload.url;

    case "TEXT":
      return payload.text;

    case "EMAIL": {
      const params = new URLSearchParams();
      if (payload.subject) params.set("subject", payload.subject);
      if (payload.body) params.set("body", payload.body);
      const query = params.toString();
      return `mailto:${payload.to}${query ? `?${query}` : ""}`;
    }

    case "SMS":
      return `SMSTO:${payload.phone}:${payload.message ?? ""}`;

    case "PHONE":
      return `tel:${payload.phone}`;

    case "WIFI":
      return `WIFI:T:${payload.encryption};S:${escapeWifiField(payload.ssid)};P:${payload.password ? escapeWifiField(payload.password) : ""};H:${payload.hidden ? "true" : "false"};;`;

    case "VCARD": {
      const fullName = [payload.firstName, payload.lastName].filter(Boolean).join(" ");
      return (
        "BEGIN:VCARD\nVERSION:3.0\n" +
        vcardLine("N", `${payload.lastName ?? ""};${payload.firstName};;;`) +
        vcardLine("FN", fullName) +
        vcardLine("ORG", payload.org) +
        vcardLine("TITLE", payload.title) +
        vcardLine("TEL", payload.phone) +
        vcardLine("EMAIL", payload.email) +
        vcardLine("URL", payload.website) +
        vcardLine("ADR", payload.address ? `;;${payload.address};;;;` : undefined) +
        "END:VCARD"
      );
    }

    case "APP_LINK":
      return payload.fallbackUrl;

    case "PDF":
      return payload.fileUrl;

    default: {
      const exhaustiveCheck: never = payload;
      throw new Error(`Unhandled QR content type: ${JSON.stringify(exhaustiveCheck)}`);
    }
  }
}

/** Picks the right redirect target for an APP_LINK type based on a request's User-Agent. */
export function resolveAppLinkTarget(
  payload: Extract<QrContentPayload, { type: "APP_LINK" }>,
  userAgent: string,
): string {
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua) && payload.iosUrl) return payload.iosUrl;
  if (/android/.test(ua) && payload.androidUrl) return payload.androidUrl;
  return payload.fallbackUrl;
}
