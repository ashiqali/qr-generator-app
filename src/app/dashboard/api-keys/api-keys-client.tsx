"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { KeyRound, Plus, Trash2 } from "lucide-react";
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
          <span className="font-bold text-foreground">{remaining}</span> key slot{remaining === 1 ? "" : "s"} available in current tier.
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger render={<Button disabled={remaining <= 0} size="sm" className="h-9.5 rounded-[14px] px-4 text-xs font-semibold shadow-xs shadow-primary/25" />}>
            <Plus className="mr-1.5 size-3.5" /> Generate Secret Key
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-[24px]">
            <DialogHeader>
              <DialogTitle className="font-heading font-bold text-lg">{newKey ? "Secret Key Generated" : "Create Developer API Key"}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {newKey
                  ? "Copy this key immediately. For security reasons, it will never be displayed again."
                  : "Assign an identifier (e.g. CI Backend, Production Ingestion) to audit usage."}
              </DialogDescription>
            </DialogHeader>

            {newKey ? (
              <div className="space-y-3 py-2">
                <div className="flex items-center gap-2 rounded-[16px] border border-emerald-500/30 bg-emerald-500/10 p-3">
                  <code className="flex-1 font-mono text-xs font-bold text-foreground truncate">{newKey}</code>
                  <CopyButton value={newKey} />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Store this key securely. Treat it with the same confidentiality as your master password.
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
                    placeholder="e.g. Production Webhook Runner"
                    className="text-xs h-10 rounded-[14px]"
                  />
                </div>
                {error && <p className="text-xs text-destructive font-medium">{error}</p>}
              </div>
            )}

            <DialogFooter className="gap-2">
              {newKey ? (
                <Button onClick={() => handleOpenChange(false)} className="rounded-[12px] text-xs font-semibold">Done</Button>
              ) : (
                <Button onClick={handleCreate} disabled={isPending} className="rounded-[12px] text-xs font-semibold">
                  {isPending ? "Generating..." : "Generate Key"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-[24px] border border-border/80 shadow-2xs overflow-hidden">
        <CardContent className="p-0">
          {keys.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-sm text-muted-foreground">
              <div className="flex size-12 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
                <KeyRound className="size-6" />
              </div>
              <p className="font-semibold text-foreground text-xs mt-2">No active API keys</p>
              <p className="text-[11px] max-w-sm">Create an API key to access endpoints programmatically via REST headers.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b border-border/70 hover:bg-transparent">
                  <TableHead className="py-3 font-bold text-xs tracking-wider uppercase">Label</TableHead>
                  <TableHead className="py-3 font-bold text-xs tracking-wider uppercase">Prefix</TableHead>
                  <TableHead className="py-3 font-bold text-xs tracking-wider uppercase">Created</TableHead>
                  <TableHead className="py-3 font-bold text-xs tracking-wider uppercase">Last Used</TableHead>
                  <TableHead className="py-3 w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id} className="border-b border-border/50">
                    <TableCell className="font-semibold text-xs text-foreground py-3.5">{key.label}</TableCell>
                    <TableCell className="py-3.5">
                      <code className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground">
                        {key.keyPrefix}••••••••
                      </code>
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(key.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-muted-foreground">
                      {key.lastUsedAt ? formatDistanceToNow(new Date(key.lastUsedAt), { addSuffix: true }) : "Never"}
                    </TableCell>
                    <TableCell className="py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleRevoke(key.id)}
                        disabled={isPending}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Revoke Key"
                      >
                        <Trash2 className="size-3.5" />
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
