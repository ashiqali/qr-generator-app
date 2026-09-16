"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { KeyRound, Plus, Trash2, ShieldCheck, Copy, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CopyButton } from "@/components/copy-button";
import { createApiKeyAction, revokeApiKeyAction } from "./actions";

export interface ApiKeyRow {
  id: string;
  label: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export function ApiKeysClient({ initialKeys, remaining }: { initialKeys: ApiKeyRow[]; remaining: number }) {
  const [keys, setKeys] = useState(initialKeys);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      const result = await createApiKeyAction(label);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setNewKey(result.rawKey);
      setLabel("");
      setKeys((prev) => [
        { id: crypto.randomUUID(), label: label || "Untitled", keyPrefix: result.rawKey.slice(0, 12), createdAt: new Date().toISOString(), lastUsedAt: null },
        ...prev,
      ]);
    });
  }

  function handleRevoke(id: string) {
    if (!confirm("Revoke this API key? Requests using it will stop working immediately.")) return;
    startTransition(async () => {
      await revokeApiKeyAction(id);
      setKeys((prev) => prev.filter((k) => k.id !== id));
      toast.success("API key revoked");
    });
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setNewKey(null);
      setError(null);
      setLabel("");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{remaining}</span> key slot{remaining === 1 ? "" : "s"} remaining on plan.
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger render={<Button disabled={remaining <= 0} size="sm" className="h-9 rounded-xl px-4 text-xs font-semibold" />}>
            <Plus className="mr-1.5 size-3.5" /> New API key
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading font-bold">{newKey ? "API Key Generated" : "Generate New API Key"}</DialogTitle>
              <DialogDescription className="text-xs">
                {newKey
                  ? "Copy this key now. For security purposes, this secret key will not be shown again."
                  : "Provide a descriptive label (e.g., CI Runner, Production Backend) to identify usage."}
              </DialogDescription>
            </DialogHeader>

            {newKey ? (
              <div className="space-y-3 py-2">
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                  <code className="flex-1 font-mono text-xs font-semibold text-foreground truncate">{newKey}</code>
                  <CopyButton value={newKey} />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Store this securely in your environment variables.
                </p>
              </div>
            ) : (
              <div className="space-y-3 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="key-label" className="text-xs font-semibold">Key Identifier</Label>
                  <Input
                    id="key-label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Next.js Production API"
                    className="text-xs h-9"
                  />
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
            )}

            <DialogFooter>
              {newKey ? (
                <Button onClick={() => handleOpenChange(false)} className="rounded-lg text-xs font-semibold">Done</Button>
              ) : (
                <Button onClick={handleCreate} disabled={isPending} className="rounded-lg text-xs font-semibold">
                  {isPending ? "Generating..." : "Generate key"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="card-sheen rounded-2xl border border-border/80 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          {keys.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-sm text-muted-foreground">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
                <KeyRound className="size-6" />
              </div>
              <p className="font-semibold text-foreground mt-2">No active API keys</p>
              <p className="text-xs text-muted-foreground max-w-sm">Create an API key above to integrate QR generation into your backend workflows.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b border-border/80">
                  <TableHead className="text-xs font-semibold uppercase">Label</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Prefix</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Created</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Last Used</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id} className="border-b border-border/60 hover:bg-muted/30">
                    <TableCell className="font-semibold text-xs text-foreground">{key.label}</TableCell>
                    <TableCell>
                      <code className="rounded-md border border-border/80 bg-muted/50 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                        {key.keyPrefix}...
                      </code>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(key.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {key.lastUsedAt ? formatDistanceToNow(new Date(key.lastUsedAt), { addSuffix: true }) : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                        disabled={isPending}
                        onClick={() => handleRevoke(key.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
