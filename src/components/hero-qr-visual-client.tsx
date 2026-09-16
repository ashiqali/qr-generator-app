"use client";

import { motion } from "motion/react";
import { BarChart3, Palette } from "lucide-react";

export function HeroQrVisualClient({ svg }: { svg: string }) {
  return (
    <motion.div
      className="relative mx-auto w-full max-w-[300px]"
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div aria-hidden className="absolute inset-0 scale-90 rounded-[2rem] bg-primary/20 blur-2xl" />

        <div className="relative overflow-hidden rounded-[1.75rem] border bg-card p-3 shadow-2xl shadow-primary/10 ring-1 ring-foreground/5">
          <div className="flex items-center gap-1.5 px-2 pt-1 pb-3">
            <span className="size-2 rounded-full bg-destructive/40" />
            <span className="size-2 rounded-full bg-primary/30" />
            <span className="size-2 rounded-full bg-muted-foreground/20" />
            <span className="ml-2 truncate text-[11px] text-muted-foreground">qrforge.app/r/8x1L9df</span>
          </div>
          <div className="relative overflow-hidden rounded-xl [&_svg]:h-full [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
          <motion.div
            aria-hidden
            className="absolute inset-x-3 h-16 bg-gradient-to-b from-transparent via-primary/25 to-transparent"
            initial={{ top: "8%" }}
            animate={{ top: ["8%", "82%", "8%"] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>
      </motion.div>

      <motion.div
        className="absolute -top-4 -right-8 hidden items-center gap-2 rounded-xl border bg-card px-3 py-2 text-xs font-medium shadow-lg sm:flex"
        initial={{ opacity: 0, y: 10, rotate: 6 }}
        animate={{ opacity: 1, y: [0, -6, 0], rotate: 6 }}
        transition={{
          opacity: { duration: 0.5, delay: 0.9 },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.9 },
        }}
      >
        <BarChart3 className="size-3.5 text-primary" />
        Live scan analytics
      </motion.div>
      <motion.div
        className="absolute -bottom-4 -left-10 hidden items-center gap-2 rounded-xl border bg-card px-3 py-2 text-xs font-medium shadow-lg sm:flex"
        initial={{ opacity: 0, y: -10, rotate: -5 }}
        animate={{ opacity: 1, y: [0, 6, 0], rotate: -5 }}
        transition={{
          opacity: { duration: 0.5, delay: 1.1 },
          y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.1 },
        }}
      >
        <Palette className="size-3.5 text-primary" />
        Fully on-brand
      </motion.div>
    </motion.div>
  );
}
