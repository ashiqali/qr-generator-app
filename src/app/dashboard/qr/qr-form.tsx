"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentFields, defaultPayloadForType, type PayloadState } from "./content-fields";
import { DesignFields } from "./design-fields";
import { QrPreview } from "./qr-preview";
import { QR_TYPE_META } from "./qr-type-icon";
import { createQrAction, updateQrAction } from "./actions";
import { DEFAULT_DESIGN, DYNAMIC_ONLY_TYPES, type QrContentType, type QrDesign } from "@/lib/qr/types";

interface Props {
  mode: "create" | "edit";
  qrId?: string;
  initialName?: string;
  initialPayload?: PayloadState;
  initialDesign?: QrDesign;
  initialIsDynamic?: boolean;
  canCustomize: boolean;
  planName: string;
}

export function QrForm({
  mode,
  qrId,
  initialName,
  initialPayload,
  initialDesign,
  initialIsDynamic,
  canCustomize,
  planName,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initialName ?? "");
  const [payload, setPayload] = useState<PayloadState>(initialPayload ?? defaultPayloadForType("URL"));
  const [design, setDesign] = useState<QrDesign>(initialDesign ?? DEFAULT_DESIGN);
  const [isDynamic, setIsDynamic] = useState(initialIsDynamic ?? false);

  const dynamicForced = DYNAMIC_ONLY_TYPES.includes(payload.type) || Boolean(initialIsDynamic);
  const effectiveDynamic = isDynamic || dynamicForced;

  function handleTypeChange(type: QrContentType) {
    setPayload(defaultPayloadForType(type));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    const input = {
      name,
      isDynamic: effectiveDynamic,
      payload: payload as never,
      design,
    };

    startTransition(async () => {
      const result =
        mode === "create" ? await createQrAction(input) : await updateQrAction(qrId!, input);

      if ("error" in result) {
        setError(result.error);
        return;
      }
      toast.success(mode === "create" ? "QR code created" : "QR code updated");
      router.push(`/dashboard/qr/${result.id}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <StaggerContainer immediate className="space-y-6">
        <StaggerItem>
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Storefront menu"
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={payload.type}
                onValueChange={(v) => handleTypeChange(v as QrContentType)}
                disabled={mode === "edit"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(QR_TYPE_META).map(([value, meta]) => (
                    <SelectItem key={value} value={value}>
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={payload.type}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <ContentFields payload={payload} onChange={setPayload} />
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Dynamic (editable &amp; trackable)</p>
                <p className="text-xs text-muted-foreground">
                  {dynamicForced
                    ? "This content type always uses a dynamic, trackable link."
                    : "Change the destination anytime without reprinting, and track scans."}
                </p>
              </div>
              <Switch
                checked={effectiveDynamic}
                disabled={dynamicForced}
                onCheckedChange={setIsDynamic}
              />
            </div>
          </CardContent>
        </Card>
        </StaggerItem>

        <StaggerItem>
        <Card>
          <CardHeader>
            <CardTitle>Design</CardTitle>
          </CardHeader>
          <CardContent>
            {canCustomize ? (
              <DesignFields design={design} onChange={setDesign} />
            ) : (
              <div className="space-y-3 rounded-md border border-dashed p-4 text-sm">
                <p>Custom colors, logo &amp; frame require a paid plan.</p>
                <Button render={<Link href="/dashboard/billing" />} size="sm" variant="outline">
                  Upgrade from {planName}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        </StaggerItem>
      </StaggerContainer>

      <FadeIn immediate delay={0.15} className="space-y-4">
        <div className="sticky top-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Live preview</CardTitle>
            </CardHeader>
            <CardContent>
              <QrPreview isDynamic={effectiveDynamic} payload={payload} design={design} />
            </CardContent>
          </Card>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Saving..." : mode === "create" ? "Create QR code" : "Save changes"}
          </Button>
        </div>
      </FadeIn>
    </form>
  );
}
