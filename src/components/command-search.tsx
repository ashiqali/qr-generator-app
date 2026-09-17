"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Search,
  Plus,
  BarChart3,
  Upload,
  KeyRound,
  Sparkles,
  Settings,
  Sun,
  Moon,
  Laptop,
  BookOpen,
  ArrowRight,
  Command,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CommandItem {
  id: string;
  title: string;
  category: "Actions" | "Navigation" | "Preferences";
  icon: typeof Search;
  shortcut?: string;
  action: () => void;
}

export function CommandSearch({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  const items: CommandItem[] = [
    {
      id: "create-qr",
      title: "Create New QR Code",
      category: "Actions",
      icon: Plus,
      shortcut: "C",
      action: () => {
        router.push("/dashboard/qr/new");
        setIsOpen(false);
      },
    },
    {
      id: "bulk-import",
      title: "Bulk Import CSV",
      category: "Actions",
      icon: Upload,
      action: () => {
        router.push("/dashboard/bulk");
        setIsOpen(false);
      },
    },
    {
      id: "qr-codes",
      title: "All QR Codes",
      category: "Navigation",
      icon: Command,
      action: () => {
        router.push("/dashboard");
        setIsOpen(false);
      },
    },
    {
      id: "analytics",
      title: "Telemetry & Analytics",
      category: "Navigation",
      icon: BarChart3,
      action: () => {
        router.push("/dashboard/analytics");
        setIsOpen(false);
      },
    },
    {
      id: "billing",
      title: "Subscription & Billing",
      category: "Navigation",
      icon: Sparkles,
      action: () => {
        router.push("/dashboard/billing");
        setIsOpen(false);
      },
    },
    {
      id: "api-keys",
      title: "REST API Keys",
      category: "Navigation",
      icon: KeyRound,
      action: () => {
        router.push("/dashboard/api-keys");
        setIsOpen(false);
      },
    },
    {
      id: "settings",
      title: "Workspace Settings",
      category: "Navigation",
      icon: Settings,
      action: () => {
        router.push("/dashboard/settings");
        setIsOpen(false);
      },
    },
    {
      id: "api-docs",
      title: "Developer API Documentation",
      category: "Navigation",
      icon: BookOpen,
      action: () => {
        router.push("/docs/api");
        setIsOpen(false);
      },
    },
    {
      id: "theme-light",
      title: "Switch to Light Mode",
      category: "Preferences",
      icon: Sun,
      action: () => {
        setTheme("light");
        setIsOpen(false);
      },
    },
    {
      id: "theme-dark",
      title: "Switch to Dark Mode",
      category: "Preferences",
      icon: Moon,
      action: () => {
        setTheme("dark");
        setIsOpen(false);
      },
    },
    {
      id: "theme-system",
      title: "Use System Theme",
      category: "Preferences",
      icon: Laptop,
      action: () => {
        setTheme("system");
        setIsOpen(false);
      },
    },
  ];

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  const categories = ["Actions", "Navigation", "Preferences"] as const;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-[24px] border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Quick Command Search</DialogTitle>
        </DialogHeader>

        {/* Input bar */}
        <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3.5">
          <Search className="size-4.5 text-muted-foreground" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-border/80 bg-muted/60 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Items List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No matching commands or pages found.
            </div>
          ) : (
            categories.map((cat) => {
              const catItems = filteredItems.filter((i) => i.category === cat);
              if (catItems.length === 0) return null;
              return (
                <div key={cat} className="mb-2">
                  <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/80">
                    {cat}
                  </div>
                  <div className="space-y-0.5">
                    {catItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={item.action}
                          className="group flex w-full items-center justify-between rounded-[12px] px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted/80 focus:bg-muted/80 outline-none"
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon className="size-4 text-muted-foreground transition-transform group-hover:scale-110 group-hover:text-primary" />
                            <span>{item.title}</span>
                          </span>
                          <span className="flex items-center gap-2 text-muted-foreground">
                            {item.shortcut && (
                              <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-semibold">
                                {item.shortcut}
                              </kbd>
                            )}
                            <ArrowRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer status */}
        <div className="flex items-center justify-between border-t border-border/60 bg-muted/30 px-4 py-2.5 text-[11px] text-muted-foreground">
          <span>Navigate with mouse or keyboard</span>
          <div className="flex items-center gap-2">
            <span>Select</span>
            <kbd className="rounded border border-border/80 bg-card px-1 py-0.5 text-[10px] font-mono">↵</kbd>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
