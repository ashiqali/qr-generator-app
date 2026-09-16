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
  LayoutList,
  LayoutGrid,
  CheckSquare,
  Square,
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
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  function handleArchive(id: string) {
    startTransition(async () => {
      await archiveQrAction(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success("QR code archived");
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Permanently delete this QR code? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteQrAction(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success("QR code deleted");
    });
  }

  function handleBulkArchive() {
    if (selectedIds.size === 0) return;
    const idsToArchive = Array.from(selectedIds);
    startTransition(async () => {
      for (const id of idsToArchive) {
        await archiveQrAction(id);
      }
      setRows((prev) => prev.filter((r) => !selectedIds.has(r.id)));
      setSelectedIds(new Set());
      toast.success(`Archived ${idsToArchive.length} QR code(s)`);
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

  const allSelected =
    filteredRows.length > 0 && filteredRows.every((r) => selectedIds.has(r.id));

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRows.map((r) => r.id)));
    }
  }

  function toggleSelectItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {/* Search, Filter & View Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search campaigns by title or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-9.5 pr-8 text-xs bg-card rounded-[14px]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Dynamic/Static Filter Pills */}
          <div className="flex items-center rounded-[12px] border border-border/80 bg-muted/40 p-1 text-xs">
            <button
              onClick={() => setFilterMode("ALL")}
              className={`rounded-[8px] px-3 py-1 font-semibold transition-colors cursor-pointer ${
                filterMode === "ALL"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({rows.length})
            </button>
            <button
              onClick={() => setFilterMode("DYNAMIC")}
              className={`rounded-[8px] px-3 py-1 font-semibold transition-colors cursor-pointer ${
                filterMode === "DYNAMIC"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dynamic ({rows.filter((r) => r.isDynamic).length})
            </button>
            <button
              onClick={() => setFilterMode("STATIC")}
              className={`rounded-[8px] px-3 py-1 font-semibold transition-colors cursor-pointer ${
                filterMode === "STATIC"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Static ({rows.filter((r) => !r.isDynamic).length})
            </button>
          </div>

          {/* List / Card View Toggle */}
          <div className="flex items-center rounded-[12px] border border-border/80 bg-muted/40 p-1 text-xs">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 rounded-[8px] px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table View"
            >
              <LayoutList className="size-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 rounded-[8px] px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Cards View"
            >
              <LayoutGrid className="size-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bulk Actions Toolbar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between rounded-[16px] border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary backdrop-blur-md shadow-xs"
          >
            <div className="flex items-center gap-2">
              <CheckSquare className="size-4 text-primary" />
              <span>{selectedIds.size} campaign(s) selected</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                onClick={handleBulkArchive}
                disabled={isPending}
                className="rounded-[10px] text-xs h-7.5 bg-card hover:bg-muted"
              >
                <Archive className="mr-1.5 size-3" /> Archive Selected
              </Button>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setSelectedIds(new Set())}
                className="text-xs h-7.5"
              >
                Deselect All
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Mode: List / Table View */}
      {viewMode === "list" ? (
        <div className="overflow-hidden rounded-[24px] border border-border/80 bg-card shadow-2xs">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b border-border/70 hover:bg-transparent">
                <TableHead className="w-10 px-3">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {allSelected ? (
                      <CheckSquare className="size-4 text-primary" />
                    ) : (
                      <Square className="size-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="py-3 font-bold text-xs tracking-wider uppercase">Campaign</TableHead>
                <TableHead className="py-3 font-bold text-xs tracking-wider uppercase">Type</TableHead>
                <TableHead className="py-3 font-bold text-xs tracking-wider uppercase">Status</TableHead>
                <TableHead className="py-3 font-bold text-xs tracking-wider uppercase">Scans</TableHead>
                <TableHead className="py-3 font-bold text-xs tracking-wider uppercase">Created</TableHead>
                <TableHead className="py-3 w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                    No QR codes found matching &ldquo;{searchQuery}&rdquo;.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((qr) => {
                  const isSelected = selectedIds.has(qr.id);
                  return (
                    <TableRow
                      key={qr.id}
                      className={`group border-b border-border/50 transition-colors ${
                        isSelected ? "bg-primary/5" : "hover:bg-muted/40"
                      }`}
                    >
                      <TableCell className="px-3">
                        <button
                          type="button"
                          onClick={() => toggleSelectItem(qr.id)}
                          className="flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="size-4 text-primary" />
                          ) : (
                            <Square className="size-4" />
                          )}
                        </button>
                      </TableCell>

                      <TableCell className="py-3 font-medium">
                        <div className="flex items-center gap-3">
                          {/* Mini QR thumbnail */}
                          <div className="relative size-10 shrink-0 overflow-hidden rounded-[10px] border border-border/80 bg-white p-1 shadow-2xs transition-transform group-hover:scale-105">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`/api/qr/${qr.id}/export?format=png`}
                              alt=""
                              className="size-full object-contain"
                              loading="lazy"
                            />
                          </div>

                          <div className="truncate">
                            <Link
                              href={`/dashboard/qr/${qr.id}`}
                              className="font-heading font-semibold text-foreground hover:text-primary transition-colors hover:underline truncate block"
                            >
                              {qr.name}
                            </Link>
                            <p className="text-[11px] text-muted-foreground">
                              {QR_TYPE_META[qr.type]?.label}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-foreground">
                          <QrTypeIcon type={qr.type} className="size-3 text-muted-foreground" />
                          {QR_TYPE_META[qr.type]?.label}
                        </span>
                      </TableCell>

                      <TableCell className="py-3">
                        {qr.isDynamic ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Dynamic
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                            Static
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="py-3">
                        {qr.isDynamic ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-heading font-bold text-foreground tabular-nums">
                              {qr.scanCount}
                            </span>
                            <span className="text-[11px] text-muted-foreground">scans</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 text-xs">Unmetered</span>
                        )}
                      </TableCell>

                      <TableCell className="py-3 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(qr.createdAt), { addSuffix: true })}
                      </TableCell>

                      <TableCell className="py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="rounded-[10px] hover:bg-muted"
                                disabled={isPending}
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="w-48 shadow-2xl">
                            <DropdownMenuItem render={<Link href={`/dashboard/qr/${qr.id}`} />}>
                              <Eye className="mr-2 size-4 text-muted-foreground" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem render={<Link href={`/dashboard/qr/${qr.id}/edit`} />}>
                              <Pencil className="mr-2 size-4 text-muted-foreground" /> Edit Campaign
                            </DropdownMenuItem>
                            <DropdownMenuItem render={<a href={`/api/qr/${qr.id}/export?format=png`} download />}>
                              <Download className="mr-2 size-4 text-muted-foreground" /> Export PNG
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleArchive(qr.id)}>
                              <Archive className="mr-2 size-4 text-muted-foreground" /> Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleDelete(qr.id)}
                              className="text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="mr-2 size-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* View Mode: Card Grid View */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRows.map((qr) => {
            const isSelected = selectedIds.has(qr.id);
            return (
              <div
                key={qr.id}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-[24px] border bg-card p-5 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                  isSelected
                    ? "border-primary ring-1 ring-primary/30"
                    : "border-border/80 hover:border-border"
                }`}
              >
                {/* Select button in top left corner */}
                <div className="flex items-start justify-between">
                  <button
                    type="button"
                    onClick={() => toggleSelectItem(qr.id)}
                    className="cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    {isSelected ? (
                      <CheckSquare className="size-4.5 text-primary" />
                    ) : (
                      <Square className="size-4.5" />
                    )}
                  </button>

                  <Badge
                    variant={qr.isDynamic ? "default" : "secondary"}
                    className="rounded-full px-2.5 py-0.5 text-[10px]"
                  >
                    {qr.isDynamic ? "Dynamic" : "Static"}
                  </Badge>
                </div>

                {/* Card Body with QR Preview */}
                <div className="flex items-center gap-4 py-4">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-[16px] border border-border/80 bg-white p-2 shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/qr/${qr.id}/export?format=png`}
                      alt={qr.name}
                      className="size-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/qr/${qr.id}`}
                      className="font-heading text-base font-bold text-foreground hover:text-primary transition-colors truncate block"
                    >
                      {qr.name}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {QR_TYPE_META[qr.type]?.label}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-xs">
                      <span className="font-heading font-extrabold text-foreground tabular-nums">
                        {qr.scanCount}
                      </span>
                      <span className="text-muted-foreground text-[11px]">scans verified</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                  <span>{formatDistanceToNow(new Date(qr.createdAt), { addSuffix: true })}</span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      render={<Link href={`/dashboard/qr/${qr.id}`} />}
                      title="Inspect"
                    >
                      <Eye className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      render={<Link href={`/dashboard/qr/${qr.id}/edit`} />}
                      title="Edit"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      render={<a href={`/api/qr/${qr.id}/export?format=png`} download />}
                      title="Download"
                    >
                      <Download className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
