"use client";

import { motion } from "motion/react";

interface Props {
  title: string;
  items: { label: string; count: number }[];
  emptyLabel?: string;
}

export function BreakdownList({ title, items, emptyLabel = "No telemetry signals recorded" }: Props) {
  const total = items.reduce((acc, i) => acc + i.count, 0);
  const max = Math.max(1, ...items.map((i) => i.count));

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-semibold uppercase tracking-wider">{title}</span>
        <span>{items.length} category entries</span>
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center rounded-[16px] border border-dashed border-border/80 bg-muted/20">
          <p className="text-xs text-muted-foreground">{emptyLabel}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => {
            const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0.0";
            return (
              <li key={item.label} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-foreground font-semibold truncate">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-[11px]">{percentage}%</span>
                    <span className="font-bold tabular-nums text-foreground">{item.count}</span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(5, (item.count / max) * 100)}%` }}
                    transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
