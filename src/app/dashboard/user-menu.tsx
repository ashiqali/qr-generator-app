"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  LogOut,
  Settings,
  Sparkles,
  Sun,
  Moon,
  Laptop,
  Shield,
} from "lucide-react";
import { signOutAction } from "./actions";

export function UserMenu({
  name,
  email,
  planName = "Standard",
}: {
  name: string | null;
  email: string;
  planName?: string;
}) {
  const { setTheme, theme } = useTheme();
  const initials = (name ?? email).slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="flex items-center gap-2.5 rounded-full border border-border/80 bg-card py-1 pr-3 pl-1 shadow-2xs hover:bg-muted/80 transition-all cursor-pointer"
          >
            <Avatar className="size-7.5 ring-2 ring-primary/20 shadow-xs">
              <AvatarFallback className="bg-primary/10 text-[11px] font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-xs font-semibold text-foreground sm:inline">
              {name ?? email.split("@")[0]}
            </span>
            <ChevronDown className="size-3 text-muted-foreground" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-60 p-2 shadow-2xl">
        <DropdownMenuGroup className="px-2.5 py-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-foreground truncate">{name || "Workspace User"}</p>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              {planName}
            </span>
          </div>
          <p className="truncate text-[11px] text-muted-foreground/90 mt-0.5">{email}</p>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem render={<Link href="/dashboard/billing" />}>
          <Sparkles className="mr-2 size-4 text-primary" />
          <span>Billing & Quota</span>
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
          <Settings className="mr-2 size-4 text-muted-foreground" />
          <span>Workspace Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Quick Theme Switcher in Dropdown */}
        <div className="px-2.5 py-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1.5">
            Interface Theme
          </p>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted/60 p-1 text-[11px]">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex items-center justify-center gap-1 rounded-lg py-1 transition-colors ${
                theme === "light"
                  ? "bg-card font-semibold text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sun className="size-3" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex items-center justify-center gap-1 rounded-lg py-1 transition-colors ${
                theme === "dark"
                  ? "bg-card font-semibold text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Moon className="size-3" />
              <span>Dark</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`flex items-center justify-center gap-1 rounded-lg py-1 transition-colors ${
                theme === "system"
                  ? "bg-card font-semibold text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Laptop className="size-3" />
              <span>Auto</span>
            </button>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => void signOutAction()}
          className="text-destructive focus:bg-destructive/10 cursor-pointer"
        >
          <LogOut className="mr-2 size-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
