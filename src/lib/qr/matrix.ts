import QRCode from "qrcode";

export interface QrMatrix {
  size: number;
  isDark: (row: number, col: number) => boolean;
}

/** Generates the raw QR module matrix for a given payload string (pure data, no styling). */
export function buildQrMatrix(
  text: string,
  errorCorrectionLevel: "L" | "M" | "Q" | "H" = "M",
): QrMatrix {
  const qr = QRCode.create(text, { errorCorrectionLevel });
  const { modules } = qr;

  return {
    size: modules.size,
    isDark: (row: number, col: number) => Boolean(modules.get(row, col)),
  };
}
