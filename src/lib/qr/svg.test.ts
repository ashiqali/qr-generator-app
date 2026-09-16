import { describe, expect, it } from "vitest";
import { buildQrMatrix } from "./matrix";
import { renderQrSvg } from "./svg";
import { DEFAULT_DESIGN } from "./types";

describe("buildQrMatrix", () => {
  it("produces a square matrix with at least one dark module", () => {
    const matrix = buildQrMatrix("https://example.com", "M");
    expect(matrix.size).toBeGreaterThan(0);

    let darkCount = 0;
    for (let row = 0; row < matrix.size; row++) {
      for (let col = 0; col < matrix.size; col++) {
        if (matrix.isDark(row, col)) darkCount++;
      }
    }
    expect(darkCount).toBeGreaterThan(0);
  });
});

describe("renderQrSvg", () => {
  const matrix = buildQrMatrix("https://example.com", "M");

  it("renders a valid svg root element sized to the matrix + quiet zone", () => {
    const svg = renderQrSvg(matrix, DEFAULT_DESIGN, { moduleSizePx: 10, quietZoneModules: 4 });
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain(`width="${(matrix.size + 8) * 10}"`);
  });

  it("falls back to default colors when given invalid color strings", () => {
    const svg = renderQrSvg(
      matrix,
      { ...DEFAULT_DESIGN, fgColor: "javascript:alert(1)", bgColor: "also-bad" },
      {},
    );
    expect(svg).not.toContain("javascript:alert(1)");
    expect(svg).toContain(DEFAULT_DESIGN.fgColor);
  });

  it("drops a logo data URL that isn't a safe base64 image", () => {
    const svg = renderQrSvg(
      matrix,
      { ...DEFAULT_DESIGN, logoDataUrl: '"><script>alert(1)</script>' },
      {},
    );
    expect(svg).not.toContain("<script>");
  });

  it("embeds a well-formed logo data URL", () => {
    const logoDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const svg = renderQrSvg(matrix, { ...DEFAULT_DESIGN, logoDataUrl }, {});
    expect(svg).toContain(logoDataUrl);
  });

  it("appends a frame banner with escaped text when frameText is set", () => {
    const svg = renderQrSvg(matrix, { ...DEFAULT_DESIGN, frameText: "<b>SCAN ME</b>" }, {});
    expect(svg).toContain("&lt;b&gt;SCAN ME&lt;/b&gt;");
    expect(svg).not.toContain("<b>SCAN ME</b>");
  });
});
