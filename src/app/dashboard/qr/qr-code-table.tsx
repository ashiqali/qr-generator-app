"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "motion/react";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Archive,
  Download,
  Eye,
  Search,
  X,
  Radio,
  ExternalLink,
  QrCode as QrIcon,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { QrTypeIcon, QR_TYPE_META } from "./qr-type-icon";
import { archiveQrAction, deleteQrAction } from "./actions";
import { toast } from "sonner";
import type { QrContentType } from "@/lib/qr/types";

export interface QrCodeRow {
  id: string;
  name: string;
  type: QrContentType;
  isDynamic: boolean;
  createdAt: string;
  scanCount: number;
}

export function QrCodeTable({ qrCodes }: { qrCodes: QrCodeRow[] }) {
  const [rows, setRows] = useState(qrCodes);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"ALL" | "DYNAMIC" | "STATIC">("ALL");
  const [isPending, startTransition] = useTransition();

  function handleArchive(id: string) {
    startTransition(async () => {
      await archiveQrAction(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast.success("QR code archived");
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Permanently delete this QR code? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteQrAction(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast.success("QR code deleted");
    });
  }

  const filteredRows = useMemo(() => {
    return rows.filter((qr) => {
      const matchesSearch =
        qr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qr.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMode =
        filterMode === "ALL"
          ? true
          : filterMode === "DYNAMIC"
            ? qr.isDynamic
            : !qr.isDynamic;
      return matchesSearch && matchesMode;
    });
  }, [rows, searchQuery, filterMode]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter by name or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 pr-8 text-xs bg-card/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border/70 bg-muted/40 p-1 text-xs">
          <button
            onClick={() => setFilterMode("ALL")}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
              filterMode === "ALL"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({rows.length})
          </button>
          <button
            onClick={() => setFilterMode("DYNAMIC")}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
              filterMode === "DYNAMIC"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Dynamic ({rows.filter((r) => r.isDynamic).length})
          </button>
          <button
            onClick={() => setFilterMode("STATIC")}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
              filterMode === "STATIC"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Static ({rows.filter((r) => !r.isDynamic).length})
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-b border-border/80 hover:bg-transparent">
              <TableHead className="py-3 font-semibold text-xs tracking-wider uppercase">Name</TableHead>
              <TableHead className="py-3 font-semibold text-xs tracking-wider uppercase">Type</TableHead>
              <TableHead className="py-3 font-semibold text-xs tracking-wider uppercase">Mode</TableHead>
              <TableHead className="py-3 font-semibold text-xs tracking-wider uppercase">Scans</TableHead>
              <TableHead className="py-3 font-semibold text-xs tracking-wider uppercase">Created</TableHead>
              <TableHead className="py-3 w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-sm text-muted-foreground">
                  No QR codes found matching &ldquo;{searchQuery}&rdquo;.
                </TableCell>
              </TableRow>
            ) : (
              <AnimatePresence initial={false}>
                {filteredRows.map((qr, index) => (
                  <motion.tr
                    key={qr.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.25, delay: index * 0.02, ease: [0.16, 1, 0.3, 1] }}
                    className="group border-b border-border/60 transition-colors hover:bg-muted/40 has-aria-expanded:bg-muted/40"
                  >
                    <TableCell className="py-3.5 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-background/80 shadow-xs transition-transform group-hover:scale-105">
                          <QrTypeIcon type={qr.type} className="size-4 text-primary" />
                        </div>
                        <div>
                          <Link
                            href={`/dashboard/qr/${qr.id}`}
                            className="font-heading font-semibold text-foreground hover:text-primary transition-colors hover:underline"
                          >
                            {qr.name}
                          </Link>
                          <p className="text-[11px] text-muted-foreground">
                            {QR_TYPE_META[qr.type]?.label}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground font-medium">
                        {QR_TYPE_META[qr.type]?.label}
                      </span>
                    </TableCell>

                    <TableCell className="py-3.5">
                      {qr.isDynamic ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Dynamic
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          <span className="size-1.5 rounded-full bg-muted-foreground/60" />
                          Static
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="py-3.5 font-medium">
                      {qr.isDynamic ? (
                        <div className="flex items-center gap-2">
                          <span className="tabular-nums font-semibold">{qr.scanCount}</span>
                          <span className="text-[10px] text-muted-foreground">scans</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </TableCell>

                    <TableCell className="py-3.5 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(qr.createdAt), { addSuffix: true })}
                    </TableCell>

                    <TableCell className="py-3.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-lg hover:bg-muted"
                              disabled={isPending}
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-48 shadow-lg">
                          <DropdownMenuItem render={<Link href={`/dashboard/qr/${qr.id}`} />}>
                            <Eye className="mr-2 size-4 text-muted-foreground" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem render={<Link href={`/dashboard/qr/${qr.id}/edit`} />}>
                            <Pencil className="mr-2 size-4 text-muted-foreground" /> Edit Destination
                          </DropdownMenuItem>
                          <DropdownMenuItem render={<a href={`/api/qr/${qr.id}/export?format=png`} download />}>
                            <Download className="mr-2 size-4 text-muted-foreground" /> Download PNG
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => handleArchive(qr.id)}>
                            <Archive className="mr-2 size-4 text-muted-foreground" /> Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => handleDelete(qr.id)}
                            className="text-destructive focus:bg-destructive/10"
                          >
                            <Trash2 className="mr-2 size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
