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
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{remaining} key slot(s) remaining on your plan.</p>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger render={<Button disabled={remaining <= 0} />}>
            <Plus className="mr-2 size-4" /> New API key
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{newKey ? "API key created" : "Create API key"}</DialogTitle>
              <DialogDescription>
                {newKey
                  ? "Copy this key now — you won't be able to see it again."
                  : "Give it a label so you can identify it later."}
              </DialogDescription>
            </DialogHeader>

            {newKey ? (
              <div className="flex items-center gap-2 rounded-md border bg-muted p-3">
                <code className="flex-1 truncate text-sm">{newKey}</code>
                <CopyButton value={newKey} />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="key-label">Label</Label>
                <Input
                  id="key-label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Production server"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            )}

            <DialogFooter>
              {newKey ? (
                <Button onClick={() => handleOpenChange(false)}>Done</Button>
              ) : (
                <Button onClick={handleCreate} disabled={isPending}>
                  {isPending ? "Creating..." : "Create key"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {keys.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
              <KeyRound className="size-6" />
              No API keys yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.label}</TableCell>
                    <TableCell>
                      <code className="text-xs text-muted-foreground">{key.keyPrefix}...</code>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(key.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {key.lastUsedAt ? formatDistanceToNow(new Date(key.lastUsedAt), { addSuffix: true }) : "Never"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" disabled={isPending} onClick={() => handleRevoke(key.id)}>
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
