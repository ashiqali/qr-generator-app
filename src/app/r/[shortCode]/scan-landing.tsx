import { QrCode, Mail, MessageSquare, Phone, Wifi } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { encodeContentPayload } from "@/lib/qr/encoders";
import type { QrContentPayload } from "@/lib/qr/types";

export function ScanLanding({ name, payload }: { name: string; payload: QrContentPayload }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/30 p-6">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <QrCode className="size-6" />
        {name}
      </div>
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm">
        <LandingContent payload={payload} />
      </div>
    </div>
  );
}

function LandingContent({ payload }: { payload: QrContentPayload }) {
  switch (payload.type) {
    case "TEXT":
      return <p className="whitespace-pre-wrap text-sm">{payload.text}</p>;

    case "EMAIL":
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <Mail className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Send an email to</p>
          <p className="font-medium">{payload.to}</p>
          <Button render={<a href={encodeContentPayload(payload)} />}>Open email app</Button>
        </div>
      );

    case "SMS":
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <MessageSquare className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Send a text to</p>
          <p className="font-medium">{payload.phone}</p>
          <Button
            render={
              <a href={`sms:${payload.phone}${payload.message ? `?body=${encodeURIComponent(payload.message)}` : ""}`} />
            }
          >
            Open messages
          </Button>
        </div>
      );

    case "PHONE":
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <Phone className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Call</p>
          <p className="font-medium">{payload.phone}</p>
          <Button render={<a href={`tel:${payload.phone}`} />}>Call now</Button>
        </div>
      );

    case "WIFI":
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <Wifi className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Join WiFi network</p>
          <p className="font-medium">{payload.ssid}</p>
          {payload.password && (
            <div className="flex items-center gap-2">
              <code className="rounded bg-muted px-2 py-1 text-sm">{payload.password}</code>
              <CopyButton value={payload.password} label="Copy password" />
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Open WiFi settings and enter this network manually — most phones don&apos;t support joining
            networks from a web link.
          </p>
        </div>
      );

    case "VCARD": {
      const vcard = encodeContentPayload(payload);
      const fullName = [payload.firstName, payload.lastName].filter(Boolean).join(" ");
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="font-medium">{fullName}</p>
          {payload.org && <p className="text-sm text-muted-foreground">{payload.org}</p>}
          <Button render={<a href={`data:text/vcard;charset=utf-8,${encodeURIComponent(vcard)}`} download="contact.vcf" />}>
            Save contact
          </Button>
        </div>
      );
    }

    default:
      return null;
  }
}
