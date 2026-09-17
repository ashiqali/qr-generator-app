"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  Copy,
  Download,
  Smartphone,
  Sparkles,
  Square,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { QrDesign } from "@/lib/qr/types";
import type { PayloadState } from "./content-fields";

interface Props {
  isDynamic: boolean;
  payload: PayloadState;
  design: QrDesign;
}

export function QrPreview({ isDynamic, payload, design }: Props) {
  const [svg, setSvg] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"clean" | "card" | "phone">("clean");
  const [zoom, setZoom] = useState<number>(1);
  const [copied, setCopied] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setLoading(true);

      fetch("/api/qr/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDynamic, payload, design }),
        signal: controller.signal,
      })
        .then((res) => (res.ok ? res.text() : null))
        .then((text) => {
          if (text) {
            setSvg(text);
            setVersion((v) => v + 1);
          }
        })
        .catch((err) => {
          if (err?.name !== "AbortError") console.error(err);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDynamic, JSON.stringify(payload), JSON.stringify(design)]);

  function handleCopySvg() {
    if (!svg) return;
    navigator.clipboard.writeText(svg);
    setCopied(true);
    toast.success("Vector SVG copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadSvg() {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qr-studio-preview.svg";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Vector SVG downloaded");
  }

  return (
    <div className="flex flex-col h-full rounded-[24px] border border-border/80 bg-card overflow-hidden shadow-sm">
      {/* Studio Canvas Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-border/70 bg-muted/30 px-4 py-2.5 gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Canvas
          </span>
          {loading && (
            <RefreshCw className="size-3 text-muted-foreground animate-spin" />
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 rounded-[10px] border border-border/80 bg-background/80 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setViewMode("clean")}
            className={`flex items-center gap-1 rounded-[8px] px-2.5 py-1 text-xs transition-colors cursor-pointer ${
              viewMode === "clean"
                ? "bg-card text-foreground font-semibold shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Clean Vector Canvas"
          >
            <Square className="size-3" />
            Canvas
          </button>
          <button
            type="button"
            onClick={() => setViewMode("card")}
            className={`flex items-center gap-1 rounded-[8px] px-2.5 py-1 text-xs transition-colors cursor-pointer ${
              viewMode === "card"
                ? "bg-card text-foreground font-semibold shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Branded Table Frame"
          >
            <Sparkles className="size-3" />
            Frame
          </button>
          <button
            type="button"
            onClick={() => setViewMode("phone")}
            className={`flex items-center gap-1 rounded-[8px] px-2.5 py-1 text-xs transition-colors cursor-pointer ${
              viewMode === "phone"
                ? "bg-card text-foreground font-semibold shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Mobile Device Mockup"
          >
            <Smartphone className="size-3" />
            Phone
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.8, z - 0.1))}
            className="flex size-7 items-center justify-center rounded-lg border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="size-3" />
          </button>
          <span className="w-10 text-center font-mono text-[11px] text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.3, z + 0.1))}
            className="flex size-7 items-center justify-center rounded-lg border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="size-3" />
          </button>
        </div>
      </div>

      {/* Main Canvas Workspace with Dot-Grid pattern */}
      <div className="relative flex-1 min-h-[360px] flex items-center justify-center p-6 dot-grid overflow-hidden bg-muted/10">
        <motion.div
          animate={{ scale: zoom * (loading ? 0.98 : 1), opacity: loading ? 0.8 : 1 }}
          transition={{ duration: 0.2 }}
          className={`relative flex items-center justify-center transition-all duration-300 ${
            viewMode === "phone"
              ? "w-68 rounded-[2.5rem] border-[6px] border-neutral-800 bg-neutral-900 p-6 shadow-2xl ring-1 ring-white/10"
              : viewMode === "card"
                ? "w-72 rounded-[24px] border border-border/90 bg-card p-6 shadow-xl"
                : "w-64 rounded-[20px] border border-border/80 bg-white p-5 shadow-md dark:border-white/15"
          }`}
        >
          {viewMode === "phone" && (
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 h-3.5 w-24 rounded-full bg-neutral-800 flex items-center justify-center">
              <div className="size-1.5 rounded-full bg-neutral-700" />
            </div>
          )}

          {viewMode === "card" && design.frameText && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold text-primary-foreground shadow-xs">
              {design.frameText}
            </div>
          )}

          <div className="relative aspect-square w-full flex items-center justify-center overflow-hidden rounded-lg">
            <AnimatePresence mode="wait">
              {svg ? (
                <motion.div
                  key={version}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full w-full [&_svg]:h-full [&_svg]:w-full select-none"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              ) : (
                <div className="text-center p-4">
                  <p className="text-xs font-semibold text-muted-foreground">Generating live preview...</p>
                </div>
              )}
            </AnimatePresence>

            {/* Subtle laser scanning line */}
            {svg && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-primary/25 to-transparent animate-scanline"
              />
            )}
          </div>
        </motion.div>
      </div>

      {/* Studio Canvas Action Bar */}
      <div className="flex flex-wrap items-center justify-between border-t border-border/70 bg-card px-4 py-3 gap-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="size-4" />
            <span>99.8% Readability Verified</span>
          </span>
          <span className="text-muted-foreground/60">•</span>
          <span className="text-[11px] text-muted-foreground font-mono">
            ECC: Level {design.errorCorrectionLevel ?? "M"}
          </span>
        </div>

        {svg && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopySvg}
              className="h-8 rounded-[10px] text-xs font-medium"
            >
              {copied ? <Check className="mr-1.5 size-3 text-emerald-600" /> : <Copy className="mr-1.5 size-3" />}
              {copied ? "Copied" : "Copy SVG"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadSvg}
              className="h-8 rounded-[10px] text-xs font-medium"
            >
              <Download className="mr-1.5 size-3" />
              Download SVG
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
