import { describe, expect, it } from "vitest";
import { encodeContentPayload, resolveAppLinkTarget } from "./encoders";

describe("encodeContentPayload", () => {
  it("passes through a URL payload unchanged", () => {
    expect(encodeContentPayload({ type: "URL", url: "https://example.com" })).toBe(
      "https://example.com",
    );
  });

  it("builds a mailto link with encoded subject/body", () => {
    const result = encodeContentPayload({
      type: "EMAIL",
      to: "a@b.com",
      subject: "Hi there",
      body: "How are you?",
    });
    expect(result).toBe("mailto:a@b.com?subject=Hi+there&body=How+are+you%3F");
  });

  it("builds a WIFI payload and escapes special characters", () => {
    const result = encodeContentPayload({
      type: "WIFI",
      ssid: 'my;wifi"net',
      password: "p:ss",
      encryption: "WPA",
      hidden: true,
    });
    expect(result).toBe('WIFI:T:WPA;S:my\\;wifi\\"net;P:p\\:ss;H:true;;');
  });

  it("builds a VCARD block with the expected fields", () => {
    const result = encodeContentPayload({
      type: "VCARD",
      firstName: "Ada",
      lastName: "Lovelace",
      org: "Analytical Engines Inc",
      phone: "555-1234",
      email: "ada@example.com",
    });
    expect(result).toContain("BEGIN:VCARD");
    expect(result).toContain("N:Lovelace;Ada;;;");
    expect(result).toContain("FN:Ada Lovelace");
    expect(result).toContain("ORG:Analytical Engines Inc");
    expect(result).toContain("TEL:555-1234");
    expect(result).toContain("END:VCARD");
  });

  it("builds a tel: link for PHONE", () => {
    expect(encodeContentPayload({ type: "PHONE", phone: "+15551234" })).toBe("tel:+15551234");
  });
});

describe("resolveAppLinkTarget", () => {
  const payload = {
    type: "APP_LINK" as const,
    iosUrl: "https://apps.apple.com/app",
    androidUrl: "https://play.google.com/app",
    fallbackUrl: "https://example.com/app",
  };

  it("picks the iOS URL for an iPhone user agent", () => {
    expect(resolveAppLinkTarget(payload, "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)")).toBe(
      payload.iosUrl,
    );
  });

  it("picks the Android URL for an Android user agent", () => {
    expect(resolveAppLinkTarget(payload, "Mozilla/5.0 (Linux; Android 14)")).toBe(
      payload.androidUrl,
    );
  });

  it("falls back for desktop user agents", () => {
    expect(resolveAppLinkTarget(payload, "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe(
      payload.fallbackUrl,
    );
  });
});
