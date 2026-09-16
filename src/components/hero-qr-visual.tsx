import { generateQrSvg } from "@/lib/qr/generate";
import { HeroQrVisualClient } from "./hero-qr-visual-client";

// A real QR code rendered by our own engine — not a stock screenshot — so the
// hero shows exactly what the product produces.
const demoSvg = generateQrSvg({
  isDynamic: false,
  payload: { type: "URL", url: "https://qrforge.app" },
  design: {
    fgColor: "#1d4ed8",
    bgColor: "#ffffff",
    dotStyle: "rounded",
    cornerStyle: "extra-rounded",
    errorCorrectionLevel: "M",
  },
  appUrl: "https://qrforge.app",
  moduleSizePx: 9,
});

export function HeroQrVisual() {
  return <HeroQrVisualClient svg={demoSvg} />;
}
