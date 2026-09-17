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
import {
  X,
  Sparkles,
  Palette,
  Shield,
  Image as ImageIcon,
  Check,
  Circle,
  Square,
  Maximize2,
} from "lucide-react";
import type { QrDesign } from "@/lib/qr/types";

const MAX_LOGO_BYTES = 250 * 1024;
const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

const COLOR_PRESETS = [
  { name: "Obsidian", fg: "#0F172A", bg: "#FFFFFF" },
  { name: "Indigo Tech", fg: "#4F46E5", bg: "#FFFFFF" },
  { name: "Cyan Spark", fg: "#0284C7", bg: "#F0F9FF" },
  { name: "Emerald Pro", fg: "#059669", bg: "#ECFDF5" },
  { name: "Amber Luxury", fg: "#D97706", bg: "#FFFBEB" },
  { name: "Midnight Dark", fg: "#F8FAFC", bg: "#0B1220" },
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
    toast.success("Palette applied");
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
      {/* Visual Geometry Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          <span>Module Geometry</span>
        </div>

        {/* Dot Style Visual Buttons */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-foreground">Pattern Style</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "square", label: "Classic", icon: Square },
              { id: "rounded", label: "Modern", icon: Maximize2 },
              { id: "dots", label: "Circular", icon: Circle },
            ].map((pattern) => {
              const Icon = pattern.icon;
              const active = (design.dotStyle ?? "square") === pattern.id;
              return (
                <button
                  key={pattern.id}
                  type="button"
                  onClick={() => set("dotStyle", pattern.id as QrDesign["dotStyle"])}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-[14px] border p-2.5 transition-all cursor-pointer ${
                    active
                      ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30"
                      : "border-border/80 bg-card/60 text-muted-foreground hover:border-border hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                  <span className="text-[11px] font-semibold">{pattern.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Corner Style Visual Buttons */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-foreground">Corner Eye Style</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "square", label: "Square" },
              { id: "rounded", label: "Soft" },
              { id: "extra-rounded", label: "Curved" },
            ].map((corner) => {
              const active = (design.cornerStyle ?? "square") === corner.id;
              return (
                <button
                  key={corner.id}
                  type="button"
                  onClick={() => set("cornerStyle", corner.id as QrDesign["cornerStyle"])}
                  className={`flex items-center justify-center rounded-[12px] border py-2 text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30"
                      : "border-border/80 bg-card/60 text-muted-foreground hover:border-border hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  {corner.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Color Palette Section */}
      <div className="space-y-3.5 border-t border-border/70 pt-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Palette className="size-3.5 text-primary" />
          <span>Color & Contrast</span>
        </div>

        {/* Curated Presets */}
        <div className="grid grid-cols-3 gap-2">
          {COLOR_PRESETS.map((preset) => {
            const active = design.fgColor === preset.fg && design.bgColor === preset.bg;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset.fg, preset.bg)}
                className={`group flex items-center gap-2 rounded-[12px] border p-2 text-left transition-all cursor-pointer ${
                  active
                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/20"
                    : "border-border/80 bg-card/60 hover:border-border hover:bg-muted/70"
                }`}
              >
                <div
                  className="size-5 shrink-0 rounded-full border border-border/80 shadow-2xs relative flex items-center justify-center"
                  style={{ backgroundColor: preset.fg }}
                >
                  {active && <Check className="size-3 text-white" />}
                </div>
                <span className="text-[11px] font-semibold text-foreground truncate">{preset.name}</span>
              </button>
            );
          })}
        </div>

        {/* Precise Hex Pickers */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="fgColor" className="text-xs font-semibold">Foreground</Label>
            <div className="flex items-center gap-2 rounded-[12px] border border-border/80 bg-card p-1">
              <input
                type="color"
                id="fgColor"
                value={design.fgColor}
                onChange={(e) => set("fgColor", e.target.value)}
                className="size-7 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0"
              />
              <Input
                value={design.fgColor}
                onChange={(e) => set("fgColor", e.target.value)}
                className="h-7 border-0 p-0 font-mono text-xs shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bgColor" className="text-xs font-semibold">Background</Label>
            <div className="flex items-center gap-2 rounded-[12px] border border-border/80 bg-card p-1">
              <input
                type="color"
                id="bgColor"
                value={design.bgColor}
                onChange={(e) => set("bgColor", e.target.value)}
                className="size-7 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0"
              />
              <Input
                value={design.bgColor}
                onChange={(e) => set("bgColor", e.target.value)}
                className="h-7 border-0 p-0 font-mono text-xs shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Brand Logo Section */}
      <div className="space-y-3.5 border-t border-border/70 pt-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <ImageIcon className="size-3.5 text-primary" />
          <span>Brand Mark / Logo</span>
        </div>

        {design.logoDataUrl ? (
          <div className="flex items-center justify-between rounded-[16px] border border-border/90 bg-muted/30 p-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={design.logoDataUrl}
                alt="Logo preview"
                className="size-10 rounded-lg border border-border bg-white p-1 object-contain shadow-2xs"
              />
              <div>
                <p className="text-xs font-bold text-foreground">Custom Logo Attached</p>
                <p className="text-[10px] text-muted-foreground">Level H (30%) Error Correction enabled</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={removeLogo}
              className="text-xs rounded-lg"
            >
              <X className="mr-1 size-3" /> Remove
            </Button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group flex flex-col items-center justify-center rounded-[16px] border-2 border-dashed border-border/90 bg-muted/20 p-4 text-center cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/40"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <ImageIcon className="size-4" />
            </div>
            <p className="mt-2 text-xs font-semibold text-foreground">Upload brand logo</p>
            <p className="text-[10px] text-muted-foreground">PNG, SVG or JPEG up to 250KB</p>
          </div>
        )}
      </div>

      {/* Frame & Error Correction */}
      <div className="space-y-3.5 border-t border-border/70 pt-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Shield className="size-3.5 text-primary" />
          <span>Callout Frame & Redundancy</span>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="frameText" className="text-xs font-semibold">Frame Banner Text</Label>
            <Input
              id="frameText"
              maxLength={40}
              placeholder="e.g. SCAN ME · VISIT MENU"
              value={design.frameText ?? ""}
              onChange={(e) => set("frameText", e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Error Correction</Label>
              <span className="text-[10px] font-medium text-muted-foreground">
                {design.errorCorrectionLevel === "H"
                  ? "30% redundancy"
                  : design.errorCorrectionLevel === "Q"
                    ? "25% redundancy"
                    : design.errorCorrectionLevel === "M"
                      ? "15% redundancy"
                      : "7% redundancy"}
              </span>
            </div>
            <Select
              value={design.errorCorrectionLevel}
              onValueChange={(v) =>
                set("errorCorrectionLevel", v as QrDesign["errorCorrectionLevel"])
              }
              disabled={Boolean(design.logoDataUrl)}
            >
              <SelectTrigger className="h-9 text-xs rounded-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Level L (7% recovery - cleanest)</SelectItem>
                <SelectItem value="M">Level M (15% recovery - balanced)</SelectItem>
                <SelectItem value="Q">Level Q (25% recovery - rugged)</SelectItem>
                <SelectItem value="H">Level H (30% recovery - logo ready)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
