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
import { X, Sparkles, Palette, Shield, Image as ImageIcon } from "lucide-react";
import type { QrDesign } from "@/lib/qr/types";

const MAX_LOGO_BYTES = 250 * 1024;
const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

const COLOR_PRESETS = [
  { name: "Classic Dark", fg: "#0f172a", bg: "#ffffff" },
  { name: "Emerald Pro", fg: "#18352b", bg: "#ffffff" },
  { name: "Cobalt Tech", fg: "#1d4ed8", bg: "#ffffff" },
  { name: "Amber Warm", fg: "#9a3412", bg: "#fffbeb" },
  { name: "Velvet Plum", fg: "#701a75", bg: "#fdf4ff" },
  { name: "Forest Tint", fg: "#14532d", bg: "#f0fdf4" },
];

interface Props {
  design: QrDesign;
  onChange: (design: QrDesign) => void;
}

export function DesignFields({ design, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof QrDesign>(key: K, value: QrDesign[K]) {
    onChange({ ...design, [key]: value });
  }

  function applyPreset(fg: string, bg: string) {
    onChange({ ...design, fgColor: fg, bgColor: bg });
    toast.success("Color preset applied");
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
    <div className="space-y-6">
      {/* Color Palette Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Palette className="size-3.5 text-primary" />
          <span>Colors & Brand Tone</span>
        </div>

        {/* Curated Presets */}
        <div className="flex flex-wrap gap-2 pt-1">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset.fg, preset.bg)}
              className="group flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-2.5 py-1 text-xs font-medium transition-all hover:border-primary/40 hover:shadow-xs"
            >
              <span
                className="size-3 rounded-full border border-border shadow-xs"
                style={{ backgroundColor: preset.fg }}
              />
              <span className="text-muted-foreground group-hover:text-foreground">{preset.name}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="fgColor" className="text-xs">Foreground color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="fgColor"
                value={design.fgColor}
                onChange={(e) => set("fgColor", e.target.value)}
                className="size-9 shrink-0 cursor-pointer rounded-lg border border-border bg-card p-0.5"
              />
              <Input
                value={design.fgColor}
                onChange={(e) => set("fgColor", e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bgColor" className="text-xs">Background color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="bgColor"
                value={design.bgColor}
                onChange={(e) => set("bgColor", e.target.value)}
                className="size-9 shrink-0 cursor-pointer rounded-lg border border-border bg-card p-0.5"
              />
              <Input
                value={design.bgColor}
                onChange={(e) => set("bgColor", e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Geometry / Style Section */}
      <div className="space-y-3 border-t border-border/80 pt-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          <span>Module & Corner Geometry</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Dot style</Label>
            <Select value={design.dotStyle} onValueChange={(v) => set("dotStyle", v as QrDesign["dotStyle"])}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">Square (Classic)</SelectItem>
                <SelectItem value="rounded">Rounded (Modern)</SelectItem>
                <SelectItem value="dots">Dots (Circular)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Corner style</Label>
            <Select
              value={design.cornerStyle}
              onValueChange={(v) => set("cornerStyle", v as QrDesign["cornerStyle"])}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">Square (Crisp)</SelectItem>
                <SelectItem value="rounded">Rounded</SelectItem>
                <SelectItem value="extra-rounded">Extra rounded (Curved)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Logo & Branding */}
      <div className="space-y-3 border-t border-border/80 pt-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <ImageIcon className="size-3.5 text-primary" />
          <span>Center Brand Logo</span>
        </div>

        {design.logoDataUrl ? (
          <div className="flex items-center justify-between rounded-xl border border-border/90 bg-muted/30 p-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={design.logoDataUrl} alt="Logo preview" className="size-11 rounded-lg border border-border bg-white p-1 object-contain shadow-xs" />
              <div>
                <p className="text-xs font-semibold text-foreground">Custom Logo Attached</p>
                <p className="text-[11px] text-muted-foreground">High error correction auto-enabled</p>
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={removeLogo} className="h-8 text-xs">
              <X className="mr-1 size-3" /> Remove
            </Button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleLogoUpload}
              className="text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Supports PNG, JPEG, WEBP, GIF up to 250KB. Automatically scales to center module.
            </p>
          </div>
        )}
      </div>

      {/* Frame & Error Correction */}
      <div className="space-y-3 border-t border-border/80 pt-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Shield className="size-3.5 text-primary" />
          <span>Callout Frame & Print Reliability</span>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="frameText" className="text-xs">Frame text banner (optional)</Label>
            <Input
              id="frameText"
              maxLength={40}
              placeholder="e.g. SCAN FOR MENU"
              value={design.frameText ?? ""}
              onChange={(e) => set("frameText", e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Error correction level</Label>
              <span className="text-[11px] text-muted-foreground">
                {design.errorCorrectionLevel === "H" ? "30% redundancy" : design.errorCorrectionLevel === "Q" ? "25% redundancy" : design.errorCorrectionLevel === "M" ? "15% redundancy" : "7% redundancy"}
              </span>
            </div>
            <Select
              value={design.errorCorrectionLevel}
              onValueChange={(v) => set("errorCorrectionLevel", v as QrDesign["errorCorrectionLevel"])}
              disabled={Boolean(design.logoDataUrl)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Low (7% recovery - smallest code density)</SelectItem>
                <SelectItem value="M">Medium (15% recovery - recommended default)</SelectItem>
                <SelectItem value="Q">Quartile (25% recovery - high durability)</SelectItem>
                <SelectItem value="H">High (30% recovery - for logos and outdoor print)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
