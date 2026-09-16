"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "motion/react";
import { MoreHorizontal, Pencil, Trash2, Archive, Download, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>Scans</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence initial={false}>
            {rows.map((qr, index) => (
              <motion.tr
                key={qr.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
                transition={{ duration: 0.35, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted"
              >
              <TableCell className="font-medium">
                <Link href={`/dashboard/qr/${qr.id}`} className="hover:underline">
                  {qr.name}
                </Link>
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <QrTypeIcon type={qr.type} className="size-4" />
                  {QR_TYPE_META[qr.type]?.label}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={qr.isDynamic ? "default" : "secondary"}>
                  {qr.isDynamic ? "Dynamic" : "Static"}
                </Badge>
              </TableCell>
              <TableCell>{qr.isDynamic ? qr.scanCount : "—"}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(qr.createdAt), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon" disabled={isPending}>
                        <MoreHorizontal className="size-4" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem render={<Link href={`/dashboard/qr/${qr.id}`} />}>
                      <Eye className="mr-2 size-4" /> View
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href={`/dashboard/qr/${qr.id}/edit`} />}>
                      <Pencil className="mr-2 size-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<a href={`/api/qr/${qr.id}/export?format=png`} />}>
                      <Download className="mr-2 size-4" /> Download PNG
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => handleArchive(qr.id)}>
                      <Archive className="mr-2 size-4" /> Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onSelect={() => handleDelete(qr.id)}>
                      <Trash2 className="mr-2 size-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}
