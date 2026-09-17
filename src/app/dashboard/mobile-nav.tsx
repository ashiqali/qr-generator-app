"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, QrCode, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { DashboardNav } from "./dashboard-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export function MobileNav({ planName = "Free" }: { planName?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon-sm" className="md:hidden rounded-xl border border-border/80">
            <Menu className="size-4.5" />
          </Button>
        }
      />
      <SheetContent side="left" className="w-76 p-6 flex flex-col justify-between rounded-r-[24px] border-r border-border/80 bg-card">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-[10px] bg-primary text-primary-foreground shadow-xs shadow-primary/25">
                <QrCode className="size-4.5" />
              </div>
              <span className="font-heading font-bold text-foreground">QRForge</span>
            </SheetTitle>
            <ThemeToggle />
          </div>

          <div className="pt-2">
            <DashboardNav onNavigate={() => setOpen(false)} />
          </div>
        </div>

        <div className="border-t border-border/70 pt-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Current Plan</span>
            <span className="font-semibold text-primary">{planName}</span>
          </div>
          <Link
            href="/dashboard/billing"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-primary/10 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
          >
            <Sparkles className="size-3.5" />
            Manage Subscription
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
