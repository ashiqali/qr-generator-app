"use client";

import { useRef } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import type { QrDesign } from "@/lib/qr/types";

const MAX_LOGO_BYTES = 250 * 1024;
const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

interface Props {
  design: QrDesign;
  onChange: (design: QrDesign) => void;
}

export function DesignFields({ design, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof QrDesign>(key: K, value: QrDesign[K]) {
    onChange({ ...design, [key]: value });
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      toast.error("Logo must be a PNG, JPEG, WEBP, or GIF image.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.error("Logo must be smaller than 250KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      set("logoDataUrl", reader.result as string);
      set("errorCorrectionLevel", "H");
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    set("logoDataUrl", undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fgColor">Foreground color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="fgColor"
              value={design.fgColor}
              onChange={(e) => set("fgColor", e.target.value)}
              className="size-9 shrink-0 rounded border"
            />
            <Input value={design.fgColor} onChange={(e) => set("fgColor", e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bgColor">Background color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="bgColor"
              value={design.bgColor}
              onChange={(e) => set("bgColor", e.target.value)}
              className="size-9 shrink-0 rounded border"
            />
            <Input value={design.bgColor} onChange={(e) => set("bgColor", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Dot style</Label>
          <Select value={design.dotStyle} onValueChange={(v) => set("dotStyle", v as QrDesign["dotStyle"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="square">Square</SelectItem>
              <SelectItem value="rounded">Rounded</SelectItem>
              <SelectItem value="dots">Dots</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Corner style</Label>
          <Select
            value={design.cornerStyle}
            onValueChange={(v) => set("cornerStyle", v as QrDesign["cornerStyle"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="square">Square</SelectItem>
              <SelectItem value="rounded">Rounded</SelectItem>
              <SelectItem value="extra-rounded">Extra rounded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Logo</Label>
        {design.logoDataUrl ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={design.logoDataUrl} alt="Logo preview" className="size-12 rounded border object-contain" />
            <Button type="button" variant="outline" size="sm" onClick={removeLogo}>
              <X className="mr-1 size-3" /> Remove
            </Button>
          </div>
        ) : (
          <Input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleLogoUpload} />
        )}
        <p className="text-xs text-muted-foreground">
          PNG/JPEG/WEBP/GIF, under 250KB. Error correction is automatically set to High when a logo is added.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="frameText">Frame text (optional)</Label>
        <Input
          id="frameText"
          maxLength={40}
          placeholder="SCAN ME"
          value={design.frameText ?? ""}
          onChange={(e) => set("frameText", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Error correction</Label>
        <Select
          value={design.errorCorrectionLevel}
          onValueChange={(v) => set("errorCorrectionLevel", v as QrDesign["errorCorrectionLevel"])}
          disabled={Boolean(design.logoDataUrl)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="L">Low</SelectItem>
            <SelectItem value="M">Medium</SelectItem>
            <SelectItem value="Q">Quartile</SelectItem>
            <SelectItem value="H">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
