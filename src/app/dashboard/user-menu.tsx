"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, Settings, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { signOutAction } from "./actions";

export function UserMenu({ name, email }: { name: string | null; email: string }) {
  const initials = (name ?? email).slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="flex items-center gap-2.5 rounded-full border border-border/60 bg-card/60 py-1 pr-2.5 pl-1.5 shadow-xs hover:bg-muted"
          >
            <Avatar className="size-7 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary/10 text-[11px] font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-xs font-semibold sm:inline">{name ?? email.split("@")[0]}</span>
            <ChevronDown className="size-3 text-muted-foreground" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl">
        <DropdownMenuGroup className="px-2 py-1.5">
          <p className="text-xs font-semibold text-foreground">{name || "Account"}</p>
          <p className="truncate text-[11px] text-muted-foreground">{email}</p>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard/billing" />}>
          <Sparkles className="mr-2 size-4 text-primary" />
          <span>Subscription</span>
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
          <Settings className="mr-2 size-4 text-muted-foreground" />
          <span>Account Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOutAction()} className="text-destructive focus:bg-destructive/10">
          <LogOut className="mr-2 size-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
