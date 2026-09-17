"use client";

import { motion } from "motion/react";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANS } from "@/lib/plans";
import type { Plan } from "@/lib/plans";

export function PlanCard({
  plan,
  featured,
  badge,
  annual = false,
  children,
}: {
  plan: (typeof PLANS)[Plan];
  featured?: boolean;
  badge?: React.ReactNode;
  annual?: boolean;
  children: React.ReactNode;
}) {
  const price = annual
    ? Math.round(plan.priceMonthly * 0.8)
    : plan.priceMonthly;

  return (
    <motion.div
      className={cn("relative flex flex-col h-full", featured && "md:-mt-3")}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
    >
      {featured && (
        <>
          <motion.div
            aria-hidden
            className="absolute inset-x-6 top-3 -z-10 h-full rounded-[28px] bg-primary/25 blur-2xl"
            animate={{ opacity: [0.35, 0.65, 0.35] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-x-0 -top-3 z-10 flex justify-center">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3.5 py-1 text-[11px] font-bold tracking-wider uppercase text-primary-foreground shadow-md shadow-primary/30">
              <Sparkles className="size-3" />
              Recommended
            </span>
          </div>
        </>
      )}

      <div
        className={cn(
          "flex flex-1 flex-col justify-between rounded-[24px] border bg-card p-8 transition-all duration-300",
          featured
            ? "border-primary/80 shadow-xl shadow-primary/10 ring-1 ring-primary/40"
            : "border-border/80 shadow-2xs hover:shadow-md hover:border-border",
        )}
      >
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-xl font-bold text-foreground">{plan.name}</h3>
            {badge}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            {plan.name === "Free"
              ? "Essential QR generation for personal projects"
              : plan.name === "Pro"
                ? "Full dynamic studio & analytics for growth teams"
                : "High-throughput API & enterprise infrastructure"}
          </p>

          <div className="mt-5 flex items-baseline gap-1.5">
            <span className="font-heading text-4xl font-extrabold tracking-tight text-foreground">
              ${price}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              /month {annual && plan.priceMonthly > 0 && <span className="text-emerald-600 dark:text-emerald-400 font-bold">(billed annually)</span>}
            </span>
          </div>

          <div className="my-6 h-px w-full bg-border/60" />

          <ul className="space-y-3.5 text-xs leading-relaxed">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <div className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                  <Check className="size-3 stroke-[2.5]" />
                </div>
                <span className="text-muted-foreground font-medium">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-8">{children}</div>
      </div>
    </motion.div>
  );
}
