export type Plan = "FREE" | "PRO" | "BUSINESS";

export const PLANS: Record<
  Plan,
  {
    name: string;
    priceMonthly: number; // USD
    stripePriceEnvVar: "STRIPE_PRICE_ID_PRO" | "STRIPE_PRICE_ID_BUSINESS" | null;
    maxQrCodes: number; // total QR codes (static + dynamic), Infinity = unlimited
    maxDynamicQrCodes: number;
    customBranding: boolean;
    bulkGeneration: boolean;
    apiAccess: boolean;
    maxApiKeys: number;
    features: string[];
  }
> = {
  FREE: {
    name: "Free",
    priceMonthly: 0,
    stripePriceEnvVar: null,
    maxQrCodes: 5,
    maxDynamicQrCodes: 1,
    customBranding: false,
    bulkGeneration: false,
    apiAccess: false,
    maxApiKeys: 0,
    features: [
      "5 QR codes",
      "1 dynamic (editable) QR code",
      "Basic scan analytics",
      "PNG export",
    ],
  },
  PRO: {
    name: "Pro",
    priceMonthly: 15,
    stripePriceEnvVar: "STRIPE_PRICE_ID_PRO",
    maxQrCodes: Infinity,
    maxDynamicQrCodes: Infinity,
    customBranding: true,
    bulkGeneration: true,
    apiAccess: false,
    maxApiKeys: 0,
    features: [
      "Unlimited QR codes",
      "Unlimited dynamic QR codes",
      "Custom colors, logo & frames",
      "Full scan analytics",
      "Bulk CSV generation",
      "PNG, SVG & PDF export",
    ],
  },
  BUSINESS: {
    name: "Business",
    priceMonthly: 49,
    stripePriceEnvVar: "STRIPE_PRICE_ID_BUSINESS",
    maxQrCodes: Infinity,
    maxDynamicQrCodes: Infinity,
    customBranding: true,
    bulkGeneration: true,
    apiAccess: true,
    maxApiKeys: 5,
    features: [
      "Everything in Pro",
      "REST API access",
      "Up to 5 API keys",
      "Priority support",
    ],
  },
};

export function getCurrentPeriod(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
