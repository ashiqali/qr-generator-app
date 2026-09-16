"use client";

import { motion, type Variants } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

export const staggerContainerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.03 } },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Animate immediately on mount (for above-the-fold content) instead of on scroll into view. */
  immediate?: boolean;
}

export function StaggerContainer({ children, className, immediate }: StaggerContainerProps) {
  const trigger = immediate
    ? { animate: "show" as const }
    : { whileInView: "show" as const, viewport: { once: true, margin: "-80px" } };

  return (
    <motion.div initial="hidden" variants={staggerContainerVariants} className={className} {...trigger}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}
