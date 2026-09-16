"use client";

import { motion } from "motion/react";
import { Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PLANS } from "@/lib/plans";
import type { Plan } from "@/lib/plans";

export function PlanCard({
  plan,
  featured,
  badge,
  children,
}: {
  plan: (typeof PLANS)[Plan];
  featured?: boolean;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={cn("relative flex flex-col", featured && "md:-mt-4")}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
    >
      {featured && (
        <>
          <motion.div
            aria-hidden
            className="absolute inset-x-4 top-2 -z-10 h-full rounded-2xl bg-primary/25 blur-2xl"
            animate={{ opacity: [0.35, 0.65, 0.35] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-x-0 -top-3 z-10 flex justify-center">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-bold tracking-wide uppercase text-primary-foreground shadow-md shadow-primary/30">
              <Sparkles className="size-3" />
              Most Popular
            </span>
          </div>
        </>
      )}
      <div
        className={cn(
          "card-sheen flex flex-1 flex-col gap-6 rounded-3xl border bg-card p-8 transition-shadow duration-300",
          featured
            ? "border-primary/60 shadow-xl shadow-primary/10 ring-1 ring-primary/40"
            : "border-border/80 shadow-xs hover:shadow-md",
        )}
      >
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-bold text-foreground">{plan.name}</h3>
            {badge}
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="font-heading text-4xl font-extrabold tracking-tight text-foreground">
              ${plan.priceMonthly}
            </span>
            <span className="text-xs font-medium text-muted-foreground">/month</span>
          </div>
        </div>

        <div className="h-px w-full bg-border/60" />

        <ul className="space-y-3 text-xs leading-relaxed">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <div className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check className="size-3 stroke-[2.5]" />
              </div>
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-4">{children}</div>
      </div>
    </motion.div>
  );
}
