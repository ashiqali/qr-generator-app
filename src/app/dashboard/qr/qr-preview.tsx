"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, Download, Smartphone, Sparkles, Square, ShieldCheck } from "lucide-react";
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
    }, 350);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDynamic, JSON.stringify(payload), JSON.stringify(design)]);

  function handleCopySvg() {
    if (!svg) return;
    navigator.clipboard.writeText(svg);
    setCopied(true);
    toast.success("QR SVG copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadSvg() {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "preview-qr.svg";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded SVG preview");
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Studio View Mode Toggles */}
      <div className="flex w-full items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Render
        </span>

        <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-muted/50 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setViewMode("clean")}
            className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
              viewMode === "clean" ? "bg-card text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Clean module canvas"
          >
            <Square className="size-3" />
            Canvas
          </button>
          <button
            type="button"
            onClick={() => setViewMode("card")}
            className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
              viewMode === "card" ? "bg-card text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Print frame style"
          >
            <Sparkles className="size-3" />
            Frame
          </button>
          <button
            type="button"
            onClick={() => setViewMode("phone")}
            className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
              viewMode === "phone" ? "bg-card text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Smartphone mockup"
          >
            <Smartphone className="size-3" />
            Device
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="w-full flex justify-center py-2">
        <motion.div
          animate={{ scale: loading ? 0.98 : 1, opacity: loading ? 0.75 : 1 }}
          transition={{ duration: 0.2 }}
          className={`relative flex w-full max-w-xs items-center justify-center overflow-hidden transition-all duration-300 ${
            viewMode === "phone"
              ? "rounded-[2rem] border-4 border-foreground/30 bg-neutral-900 p-6 shadow-xl"
              : viewMode === "card"
                ? "rounded-2xl border border-border/80 bg-card p-6 shadow-md"
                : "rounded-xl border border-border/70 bg-white p-5 shadow-xs"
          }`}
        >
          {viewMode === "phone" && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 h-3.5 w-20 rounded-full bg-neutral-800" />
          )}

          <div className="relative aspect-square w-full flex items-center justify-center overflow-hidden rounded-lg">
            <AnimatePresence mode="wait">
              {svg ? (
                <motion.div
                  key={version}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full w-full [&_svg]:h-full [&_svg]:w-full"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center p-4"
                >
                  <p className="text-sm font-medium text-muted-foreground">Fill in the content to preview</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">Updates render in real time</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Laser scanning beam */}
            {svg && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-scanline"
              />
            )}
          </div>

          {loading && (
            <motion.div
              aria-hidden
              className="absolute inset-x-0 top-0 h-0.5 bg-primary"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              style={{ transformOrigin: "left" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          )}
        </motion.div>
      </div>

      {/* Scannability & Quick Actions Footer */}
      <div className="w-full space-y-2.5 pt-1">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="size-3.5" /> High Scannability
          </span>
          <span className="font-mono">Correction Level {design.errorCorrectionLevel}</span>
        </div>

        {svg && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopySvg}
              className="h-8 text-xs font-medium"
            >
              {copied ? <Check className="mr-1.5 size-3 text-emerald-600" /> : <Copy className="mr-1.5 size-3" />}
              {copied ? "Copied" : "Copy SVG"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadSvg}
              className="h-8 text-xs font-medium"
            >
              <Download className="mr-1.5 size-3" />
              Download
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
