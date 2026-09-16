"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
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
            className="absolute inset-x-4 top-2 -z-10 h-full rounded-2xl bg-primary/20 blur-xl"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-x-0 -top-3 z-10 flex justify-center">
            <Badge className="shadow-sm">Most popular</Badge>
          </div>
        </>
      )}
      <div
        className={cn(
          "flex flex-1 flex-col gap-6 rounded-2xl border bg-card p-7",
          featured ? "border-primary shadow-lg shadow-primary/10" : "border-border shadow-sm",
        )}
      >
        <div>
          <div className="flex items-center justify-between">
            <p className="font-medium">{plan.name}</p>
            {badge}
          </div>
          <p className="mt-3 text-4xl font-semibold tracking-tight">
            ${plan.priceMonthly}
            <span className="text-sm font-normal text-muted-foreground">/mo</span>
          </p>
        </div>

        <ul className="space-y-2.5 text-sm">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-2">{children}</div>
      </div>
    </motion.div>
  );
}
