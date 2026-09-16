"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Building, QrCode } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WorkspaceSwitcher({ planName }: { planName: string }) {
  const [selectedWorkspace, setSelectedWorkspace] = useState("Acme Production");

  const workspaces = [
    { name: "Acme Production", type: "Default Team", active: true },
    { name: "Global Marketing 2026", type: "Campaign Workspace", active: false },
    { name: "Staging Sandbox", type: "Dev Workspace", active: false },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group flex w-full items-center justify-between gap-3 rounded-[16px] border border-border/80 bg-card/60 p-2 text-left shadow-2xs hover:bg-card hover:border-border transition-all outline-none cursor-pointer"
      >
        <div className="flex items-center gap-2.5 truncate">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-primary text-primary-foreground shadow-xs shadow-primary/25">
            <QrCode className="size-4.5" />
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-foreground truncate">{selectedWorkspace}</p>
            <p className="text-[10px] font-medium text-muted-foreground">{planName} Tier</p>
          </div>
        </div>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground/80 group-hover:text-foreground transition-colors" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64 p-2 shadow-2xl">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Workspaces
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        {workspaces.map((ws) => (
          <DropdownMenuItem
            key={ws.name}
            onClick={() => setSelectedWorkspace(ws.name)}
            className="flex items-center justify-between cursor-pointer py-2"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex size-6 items-center justify-center rounded-lg bg-muted text-foreground text-xs font-semibold">
                <Building className="size-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{ws.name}</p>
                <p className="text-[10px] text-muted-foreground">{ws.type}</p>
              </div>
            </div>
            {ws.name === selectedWorkspace && (
              <Check className="size-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer text-muted-foreground hover:text-foreground">
          <Plus className="mr-2 size-3.5" />
          <span className="text-xs">Create New Workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
