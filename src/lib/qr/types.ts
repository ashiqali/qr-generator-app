export type QrContentType =
  | "URL"
  | "TEXT"
  | "EMAIL"
  | "SMS"
  | "PHONE"
  | "WIFI"
  | "VCARD"
  | "APP_LINK"
  | "PDF";

/** Content types that only make sense as a dynamic (server-mediated) QR code. */
export const DYNAMIC_ONLY_TYPES: QrContentType[] = ["APP_LINK", "PDF"];

export type QrContentPayload =
  | { type: "URL"; url: string }
  | { type: "TEXT"; text: string }
  | { type: "EMAIL"; to: string; subject?: string; body?: string }
  | { type: "SMS"; phone: string; message?: string }
  | { type: "PHONE"; phone: string }
  | { type: "WIFI"; ssid: string; password?: string; encryption: "WPA" | "WEP" | "nopass"; hidden?: boolean }
  | {
      type: "VCARD";
      firstName: string;
      lastName?: string;
      org?: string;
      title?: string;
      phone?: string;
      email?: string;
      website?: string;
      address?: string;
    }
  | { type: "APP_LINK"; iosUrl?: string; androidUrl?: string; fallbackUrl: string }
  | { type: "PDF"; fileUrl: string; title?: string };

export type DotStyle = "square" | "rounded" | "dots";
export type CornerStyle = "square" | "rounded" | "extra-rounded";

export interface QrDesign {
  fgColor: string;
  bgColor: string;
  dotStyle: DotStyle;
  cornerStyle: CornerStyle;
  logoDataUrl?: string;
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
  frameText?: string;
}

export const DEFAULT_DESIGN: QrDesign = {
  fgColor: "#0f172a",
  bgColor: "#ffffff",
  dotStyle: "rounded",
  cornerStyle: "extra-rounded",
  errorCorrectionLevel: "M",
};
