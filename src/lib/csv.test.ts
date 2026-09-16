import { describe, expect, it } from "vitest";
import { parseBulkCsv } from "./csv";

describe("parseBulkCsv", () => {
  it("parses rows and skips a header row", () => {
    const csv = "name,url\nHome,https://example.com\nAbout,https://example.com/about";
    expect(parseBulkCsv(csv)).toEqual([
      { name: "Home", url: "https://example.com" },
      { name: "About", url: "https://example.com/about" },
    ]);
  });

  it("parses rows with no header when it doesn't look like one", () => {
    const csv = "Home,https://example.com";
    expect(parseBulkCsv(csv)).toEqual([{ name: "Home", url: "https://example.com" }]);
  });

  it("handles quoted fields containing commas", () => {
    const csv = 'name,url\n"Store, Downtown",https://example.com/store';
    expect(parseBulkCsv(csv)).toEqual([{ name: "Store, Downtown", url: "https://example.com/store" }]);
  });

  it("skips rows missing a name or url", () => {
    const csv = "name,url\n,https://example.com\nHome,";
    expect(parseBulkCsv(csv)).toEqual([]);
  });

  it("returns an empty array for empty input", () => {
    expect(parseBulkCsv("")).toEqual([]);
  });
});
