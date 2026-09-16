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
      <SheetContent side="left" className="w-64 p-4">
        <SheetTitle className="flex items-center gap-2 font-semibold">
          <QrCode className="size-6" />
          QRForge
        </SheetTitle>
        <div className="mt-6" onClick={() => setOpen(false)}>
          <DashboardNav />
        </div>
        <Link href="/dashboard/billing" onClick={() => setOpen(false)} className="mt-6 block text-sm text-primary underline underline-offset-4">
          Manage billing
        </Link>
      </SheetContent>
    </Sheet>
  );
}
