"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { QrContentType } from "@/lib/qr/types";

// Loosely-typed working state for the field renderer: it always holds the exact
// keys for the current `type`, but TS can't narrow a dynamically-switched union
// as cleanly as a real discriminated value, so we work with a plain record here
// and let the zod schema be the source of truth for validation on submit.
export type PayloadState = Record<string, unknown> & { type: QrContentType };

export function defaultPayloadForType(type: QrContentType): PayloadState {
  switch (type) {
    case "URL":
      return { type, url: "" };
    case "TEXT":
      return { type, text: "" };
    case "EMAIL":
      return { type, to: "", subject: "", body: "" };
    case "SMS":
      return { type, phone: "", message: "" };
    case "PHONE":
      return { type, phone: "" };
    case "WIFI":
      return { type, ssid: "", password: "", encryption: "WPA", hidden: false };
    case "VCARD":
      return {
        type,
        firstName: "",
        lastName: "",
        org: "",
        title: "",
        phone: "",
        email: "",
        website: "",
        address: "",
      };
    case "APP_LINK":
      return { type, iosUrl: "", androidUrl: "", fallbackUrl: "" };
    case "PDF":
      return { type, fileUrl: "", title: "" };
  }
}

interface Props {
  payload: PayloadState;
  onChange: (payload: PayloadState) => void;
}

export function ContentFields({ payload, onChange }: Props) {
  function set(key: string, value: unknown) {
    onChange({ ...payload, [key]: value });
  }

  const str = (key: string) => (typeof payload[key] === "string" ? (payload[key] as string) : "");

  switch (payload.type) {
    case "URL":
      return (
        <Field label="Destination URL" htmlFor="url">
          <Input
            id="url"
            type="url"
            placeholder="https://example.com"
            value={str("url")}
            onChange={(e) => set("url", e.target.value)}
          />
        </Field>
      );

    case "TEXT":
      return (
        <Field label="Text" htmlFor="text">
          <Textarea
            id="text"
            rows={5}
            placeholder="Any plain text"
            value={str("text")}
            onChange={(e) => set("text", e.target.value)}
          />
        </Field>
      );

    case "EMAIL":
      return (
        <div className="space-y-4">
          <Field label="Recipient email" htmlFor="to">
            <Input id="to" type="email" value={str("to")} onChange={(e) => set("to", e.target.value)} />
          </Field>
          <Field label="Subject (optional)" htmlFor="subject">
            <Input id="subject" value={str("subject")} onChange={(e) => set("subject", e.target.value)} />
          </Field>
          <Field label="Body (optional)" htmlFor="body">
            <Textarea id="body" rows={3} value={str("body")} onChange={(e) => set("body", e.target.value)} />
          </Field>
        </div>
      );

    case "SMS":
      return (
        <div className="space-y-4">
          <Field label="Phone number" htmlFor="phone">
            <Input id="phone" value={str("phone")} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="Message (optional)" htmlFor="message">
            <Textarea id="message" rows={3} value={str("message")} onChange={(e) => set("message", e.target.value)} />
          </Field>
        </div>
      );

    case "PHONE":
      return (
        <Field label="Phone number" htmlFor="phone">
          <Input id="phone" value={str("phone")} onChange={(e) => set("phone", e.target.value)} />
        </Field>
      );

    case "WIFI":
      return (
        <div className="space-y-4">
          <Field label="Network name (SSID)" htmlFor="ssid">
            <Input id="ssid" value={str("ssid")} onChange={(e) => set("ssid", e.target.value)} />
          </Field>
          <Field label="Password" htmlFor="password">
            <Input id="password" value={str("password")} onChange={(e) => set("password", e.target.value)} />
          </Field>
          <Field label="Encryption" htmlFor="encryption">
            <Select value={str("encryption") || "WPA"} onValueChange={(v) => set("encryption", v)}>
              <SelectTrigger id="encryption">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WPA">WPA/WPA2</SelectItem>
                <SelectItem value="WEP">WEP</SelectItem>
                <SelectItem value="nopass">No password</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <div className="flex items-center gap-2">
            <Switch
              id="hidden"
              checked={Boolean(payload.hidden)}
              onCheckedChange={(v) => set("hidden", v)}
            />
            <Label htmlFor="hidden">Hidden network</Label>
          </div>
        </div>
      );

    case "VCARD":
      return (
        <div className="grid grid-cols-2 gap-4">
          <Field label="First name" htmlFor="firstName">
            <Input id="firstName" value={str("firstName")} onChange={(e) => set("firstName", e.target.value)} />
          </Field>
          <Field label="Last name" htmlFor="lastName">
            <Input id="lastName" value={str("lastName")} onChange={(e) => set("lastName", e.target.value)} />
          </Field>
          <Field label="Organization" htmlFor="org">
            <Input id="org" value={str("org")} onChange={(e) => set("org", e.target.value)} />
          </Field>
          <Field label="Title" htmlFor="title">
            <Input id="title" value={str("title")} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="Phone" htmlFor="vphone">
            <Input id="vphone" value={str("phone")} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="Email" htmlFor="vemail">
            <Input id="vemail" type="email" value={str("email")} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Website" htmlFor="website">
            <Input id="website" type="url" value={str("website")} onChange={(e) => set("website", e.target.value)} />
          </Field>
          <Field label="Address" htmlFor="address">
            <Input id="address" value={str("address")} onChange={(e) => set("address", e.target.value)} />
          </Field>
        </div>
      );

    case "APP_LINK":
      return (
        <div className="space-y-4">
          <Field label="iOS App Store URL (optional)" htmlFor="iosUrl">
            <Input id="iosUrl" type="url" value={str("iosUrl")} onChange={(e) => set("iosUrl", e.target.value)} />
          </Field>
          <Field label="Android Play Store URL (optional)" htmlFor="androidUrl">
            <Input
              id="androidUrl"
              type="url"
              value={str("androidUrl")}
              onChange={(e) => set("androidUrl", e.target.value)}
            />
          </Field>
          <Field label="Fallback URL" htmlFor="fallbackUrl">
            <Input
              id="fallbackUrl"
              type="url"
              value={str("fallbackUrl")}
              onChange={(e) => set("fallbackUrl", e.target.value)}
            />
          </Field>
          <p className="text-xs text-muted-foreground">
            Scanners are sent to the matching store link based on their device, or the fallback URL otherwise.
          </p>
        </div>
      );

    case "PDF":
      return (
        <div className="space-y-4">
          <Field label="Hosted file URL" htmlFor="fileUrl">
            <Input id="fileUrl" type="url" value={str("fileUrl")} onChange={(e) => set("fileUrl", e.target.value)} />
          </Field>
          <Field label="Title (optional)" htmlFor="pdfTitle">
            <Input id="pdfTitle" value={str("title")} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <p className="text-xs text-muted-foreground">
            Upload your PDF/menu/brochure elsewhere and paste the direct link here.
          </p>
        </div>
      );

    default:
      return null;
  }
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
