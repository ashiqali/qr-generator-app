"use client";

import { motion } from "motion/react";

interface Props {
  title: string;
  items: { label: string; count: number }[];
  emptyLabel?: string;
}

export function BreakdownList({ title, items, emptyLabel = "No data yet" }: Props) {
  const max = Math.max(1, ...items.map((i) => i.count));

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={item.label} title={`${item.label}: ${item.count}`} className="flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0 truncate">{item.label}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <motion.span
                  className="block h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(4, (item.count / max) * 100)}%` }}
                  transition={{ duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                />
              </span>
              <span className="w-8 shrink-0 text-right tabular-nums text-muted-foreground">{item.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
