"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  KeyRound,
  LayoutGrid,
  Settings,
  Sparkles,
  Upload,
} from "lucide-react";

interface NavGroup {
  label?: string;
  items: {
    href: string;
    label: string;
    icon: typeof LayoutGrid;
    exact?: boolean;
    badge?: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    label: "Core Studio",
    items: [
      { href: "/dashboard", label: "QR Codes", icon: LayoutGrid, exact: true },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/bulk", label: "Bulk Generator", icon: Upload },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/dashboard/api-keys", label: "API Keys", icon: KeyRound },
      { href: "/dashboard/billing", label: "Subscription", icon: Sparkles },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function DashboardNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6">
      {navGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-1.5">
          {group.label && (
            <p className="px-3 text-[10px] font-bold tracking-[0.14em] text-muted-foreground/70 uppercase">
              {group.label}
            </p>
          )}
          <nav className="flex flex-col gap-1">
            {group.items.map((link) => {
              const active = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href);
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onNavigate}
                  className={cn(
                    "group relative flex items-center justify-between rounded-[12px] px-3 py-2 text-xs font-semibold transition-all duration-150 outline-none",
                    active
                      ? "text-primary dark:text-white"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="dashboard-nav-active"
                      className="absolute inset-0 rounded-[12px] bg-primary/10 border border-primary/20 dark:bg-white/10 dark:border-white/15"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                        active
                          ? "text-primary dark:text-white"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    <span>{link.label}</span>
                  </span>
                  {link.badge && (
                    <span
                      className={cn(
                        "relative z-10 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
}
