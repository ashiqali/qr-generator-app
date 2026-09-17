"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { CommandSearch } from "@/components/command-search";

export function SearchTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex h-9.5 items-center gap-3 rounded-[12px] border border-border/80 bg-muted/40 px-3 text-xs text-muted-foreground transition-all hover:border-border hover:bg-card hover:text-foreground cursor-pointer outline-none"
      >
        <Search className="size-3.5 transition-transform group-hover:scale-110" />
        <span className="hidden sm:inline">Search campaigns, routes, tools...</span>
        <span className="sm:hidden">Search...</span>
        <kbd className="ml-auto hidden md:inline-flex items-center gap-0.5 rounded border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground shadow-2xs">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandSearch open={open} onOpenChange={setOpen} />
    </>
  );
}
