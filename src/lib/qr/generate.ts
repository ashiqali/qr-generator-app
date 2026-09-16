import "server-only";
import { buildQrMatrix } from "./matrix";
import { renderQrSvg } from "./svg";
import { encodeContentPayload } from "./encoders";
import type { QrContentPayload, QrDesign } from "./types";

export function buildQrTargetString(params: {
  isDynamic: boolean;
  shortCode?: string | null;
  payload: QrContentPayload;
  appUrl: string;
}): string {
  if (params.isDynamic) {
    if (!params.shortCode) throw new Error("Dynamic QR codes require a shortCode");
    return `${params.appUrl}/r/${params.shortCode}`;
  }
  return encodeContentPayload(params.payload);
}

export function generateQrSvg(params: {
  isDynamic: boolean;
  shortCode?: string | null;
  payload: QrContentPayload;
  design: QrDesign;
  appUrl: string;
  moduleSizePx?: number;
}): string {
  const text = buildQrTargetString(params);
  // Logos obscure part of the code, so force high error correction whenever one is present.
  const errorCorrectionLevel = params.design.logoDataUrl ? "H" : params.design.errorCorrectionLevel;
  const matrix = buildQrMatrix(text, errorCorrectionLevel);
  return renderQrSvg(matrix, params.design, { moduleSizePx: params.moduleSizePx });
}
