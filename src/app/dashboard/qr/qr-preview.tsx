"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
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

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        animate={{ scale: loading ? 0.98 : 1, opacity: loading ? 0.7 : 1 }}
        transition={{ duration: 0.2 }}
        className="relative flex aspect-square w-full max-w-xs items-center justify-center overflow-hidden rounded-lg border bg-white p-4 shadow-sm"
      >
        <AnimatePresence mode="wait">
          {svg ? (
            <motion.div
              key={version}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="h-full w-full [&_svg]:h-full [&_svg]:w-full"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ) : (
            <motion.p
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted-foreground"
            >
              Fill in the content to preview
            </motion.p>
          )}
        </AnimatePresence>
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
  );
}
