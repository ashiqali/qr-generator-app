"use client";

import { motion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  immediate?: boolean;
}

export function FadeIn({ children, className, delay = 0, y = 16, immediate }: FadeInProps) {
  const trigger = immediate
    ? { animate: { opacity: 1, y: 0 } }
    : { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" } };

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      className={className}
      {...trigger}
    >
      {children}
    </motion.div>
  );
}
