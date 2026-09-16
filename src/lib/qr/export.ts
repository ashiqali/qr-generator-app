import "server-only";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";

const PRINT_DPI = 300;

export async function svgToPngBuffer(svg: string, widthPx = 1024): Promise<Buffer> {
  return sharp(Buffer.from(svg), { density: PRINT_DPI }).resize(widthPx).png().toBuffer();
}

export async function svgToPdfBuffer(svg: string, widthPx = 1200): Promise<Buffer> {
  const pngBytes = await svgToPngBuffer(svg, widthPx);
  const pdfDoc = await PDFDocument.create();
  const pngImage = await pdfDoc.embedPng(pngBytes);

  const pageWidthPt = (pngImage.width / PRINT_DPI) * 72;
  const pageHeightPt = (pngImage.height / PRINT_DPI) * 72;
  const page = pdfDoc.addPage([pageWidthPt, pageHeightPt]);
  page.drawImage(pngImage, { x: 0, y: 0, width: pageWidthPt, height: pageHeightPt });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
