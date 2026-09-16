import type { QrDesign } from "./types";
import type { QrMatrix } from "./matrix";

const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const SAFE_LOGO_DATA_URL_RE = /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/;

function sanitizeColor(color: string | undefined, fallback: string): string {
  return color && HEX_COLOR_RE.test(color) ? color : fallback;
}

function sanitizeLogoDataUrl(url: string | undefined): string | undefined {
  return url && SAFE_LOGO_DATA_URL_RE.test(url) ? url : undefined;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderModule(x: number, y: number, size: number, style: QrDesign["dotStyle"], fill: string): string {
  switch (style) {
    case "dots": {
      const r = size * 0.42;
      return `<circle cx="${x + size / 2}" cy="${y + size / 2}" r="${r}" fill="${fill}" />`;
    }
    case "rounded": {
      const r = size * 0.3;
      return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${r}" ry="${r}" fill="${fill}" />`;
    }
    case "square":
    default:
      return `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${fill}" />`;
  }
}

function renderFinder(
  originX: number,
  originY: number,
  moduleSizePx: number,
  cornerStyle: QrDesign["cornerStyle"],
  fill: string,
): string {
  const outerSize = 7 * moduleSizePx;
  const strokeWidth = moduleSizePx;
  const outerRadius =
    cornerStyle === "square" ? 0 : cornerStyle === "rounded" ? outerSize * 0.2 : outerSize * 0.38;

  const innerSize = 3 * moduleSizePx;
  const innerX = originX + 2 * moduleSizePx;
  const innerY = originY + 2 * moduleSizePx;
  const innerRadius =
    cornerStyle === "square" ? 0 : cornerStyle === "rounded" ? innerSize * 0.25 : innerSize * 0.5;

  return `
    <rect x="${originX + strokeWidth / 2}" y="${originY + strokeWidth / 2}" width="${outerSize - strokeWidth}" height="${outerSize - strokeWidth}" rx="${outerRadius}" ry="${outerRadius}" fill="none" stroke="${fill}" stroke-width="${strokeWidth}" />
    <rect x="${innerX}" y="${innerY}" width="${innerSize}" height="${innerSize}" rx="${innerRadius}" ry="${innerRadius}" fill="${fill}" />
  `;
}

export interface RenderQrSvgOptions {
  moduleSizePx?: number;
  quietZoneModules?: number;
}

/** Renders a styled QR code (matrix + design) to a standalone SVG string. */
export function renderQrSvg(matrix: QrMatrix, design: QrDesign, options: RenderQrSvgOptions = {}): string {
  const moduleSizePx = options.moduleSizePx ?? 10;
  const quietZone = options.quietZoneModules ?? 4;
  const fgColor = sanitizeColor(design.fgColor, "#0f172a");
  const bgColor = sanitizeColor(design.bgColor, "#ffffff");
  const logoDataUrl = sanitizeLogoDataUrl(design.logoDataUrl);

  const finderSize = 7;
  const isInFinderZone = (row: number, col: number) => {
    const inTopLeft = row < finderSize && col < finderSize;
    const inTopRight = row < finderSize && col >= matrix.size - finderSize;
    const inBottomLeft = row >= matrix.size - finderSize && col < finderSize;
    return inTopLeft || inTopRight || inBottomLeft;
  };

  let excavate: { row0: number; row1: number; col0: number; col1: number } | null = null;
  if (logoDataUrl) {
    const logoModules = Math.max(5, Math.floor(matrix.size * 0.26));
    const start = Math.floor((matrix.size - logoModules) / 2);
    excavate = { row0: start, row1: start + logoModules, col0: start, col1: start + logoModules };
  }

  const cells: string[] = [];
  for (let row = 0; row < matrix.size; row++) {
    for (let col = 0; col < matrix.size; col++) {
      if (!matrix.isDark(row, col)) continue;
      if (isInFinderZone(row, col)) continue;
      if (excavate && row >= excavate.row0 && row < excavate.row1 && col >= excavate.col0 && col < excavate.col1) {
        continue;
      }
      const x = (col + quietZone) * moduleSizePx;
      const y = (row + quietZone) * moduleSizePx;
      cells.push(renderModule(x, y, moduleSizePx, design.dotStyle, fgColor));
    }
  }

  const finderOrigins = [
    { row: 0, col: 0 },
    { row: 0, col: matrix.size - finderSize },
    { row: matrix.size - finderSize, col: 0 },
  ];
  const finders = finderOrigins.map((pos) =>
    renderFinder(
      (pos.col + quietZone) * moduleSizePx,
      (pos.row + quietZone) * moduleSizePx,
      moduleSizePx,
      design.cornerStyle,
      fgColor,
    ),
  );

  let logoMarkup = "";
  if (logoDataUrl && excavate) {
    const logoPx = (excavate.col1 - excavate.col0) * moduleSizePx;
    const x = (excavate.col0 + quietZone) * moduleSizePx;
    const y = (excavate.row0 + quietZone) * moduleSizePx;
    const padding = logoPx * 0.1;
    logoMarkup = `
      <rect x="${x}" y="${y}" width="${logoPx}" height="${logoPx}" rx="${logoPx * 0.18}" fill="${bgColor}" />
      <image href="${logoDataUrl}" x="${x + padding}" y="${y + padding}" width="${logoPx - padding * 2}" height="${logoPx - padding * 2}" preserveAspectRatio="xMidYMid slice" />
    `;
  }

  const qrDim = (matrix.size + quietZone * 2) * moduleSizePx;
  const frameHeight = design.frameText ? Math.round(moduleSizePx * 5.5) : 0;
  const totalHeight = qrDim + frameHeight;

  let frameMarkup = "";
  if (design.frameText) {
    const fontSize = Math.round(moduleSizePx * 2.2);
    frameMarkup = `
      <rect x="0" y="${qrDim}" width="${qrDim}" height="${frameHeight}" fill="${fgColor}" />
      <text x="${qrDim / 2}" y="${qrDim + frameHeight / 2}" fill="${bgColor}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${fontSize}" text-anchor="middle" dominant-baseline="central">${escapeXml(design.frameText)}</text>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${qrDim} ${totalHeight}" width="${qrDim}" height="${totalHeight}">
  <rect x="0" y="0" width="${qrDim}" height="${totalHeight}" fill="${bgColor}" />
  ${cells.join("")}
  ${finders.join("")}
  ${logoMarkup}
  ${frameMarkup}
</svg>`;
}
