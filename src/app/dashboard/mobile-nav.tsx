"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { DashboardNav } from "./dashboard-nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="size-5" />
          </Button>
        }
      />
      <SheetContent side="left" className="w-72 p-5">
        <SheetTitle className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <QrCode className="size-4" />
          </div>
          <span className="font-heading font-bold">QRForge</span>
        </SheetTitle>
        <div className="mt-8" onClick={() => setOpen(false)}>
          <DashboardNav />
        </div>
        <div className="mt-8 border-t border-border pt-4">
          <Link
            href="/dashboard/billing"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between text-xs font-medium text-primary hover:underline"
          >
            <span>Subscription & Billing</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
