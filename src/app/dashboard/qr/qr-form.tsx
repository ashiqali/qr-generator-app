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
import { QR_TYPE_META, QrTypeIcon } from "./qr-type-icon";
import { createQrAction, updateQrAction } from "./actions";
import { DEFAULT_DESIGN, DYNAMIC_ONLY_TYPES, type QrContentType, type QrDesign } from "@/lib/qr/types";
import { Radio, Sparkles, Layers, Sliders, ArrowRight } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <StaggerContainer immediate className="space-y-6">
        {/* Content & Destination Card */}
        <StaggerItem>
          <Card className="card-sheen rounded-2xl border border-border/80 shadow-xs">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                <CardTitle className="font-heading text-lg font-bold">Content & Destination</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Storefront Window Menu"
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Type</Label>
                <Select
                  value={payload.type}
                  onValueChange={(v) => handleTypeChange(v as QrContentType)}
                  disabled={mode === "edit"}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(QR_TYPE_META).map(([value, meta]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <QrTypeIcon type={value as QrContentType} className="size-3.5 text-primary" />
                          <span>{meta.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={payload.type}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ContentFields payload={payload} onChange={setPayload} />
                </motion.div>
              </AnimatePresence>

              {/* Dynamic vs Static Card */}
              <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/30 p-4 transition-colors hover:bg-muted/40">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-2">
                    <Radio className="size-3.5 text-primary" />
                    <p className="text-sm font-semibold text-foreground">Dynamic (Trackable & Editable)</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dynamicForced
                      ? "This content type automatically routes through a trackable link."
                      : "Update the destination URL anytime after printing, and track scan analytics."}
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

        {/* Design Card */}
        <StaggerItem>
          <Card className="card-sheen rounded-2xl border border-border/80 shadow-xs">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <Sliders className="size-4 text-primary" />
                <CardTitle className="font-heading text-lg font-bold">Visual Design & Customization</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              {canCustomize ? (
                <DesignFields design={design} onChange={setDesign} />
              ) : (
                <div className="space-y-3 rounded-xl border border-dashed border-border/80 bg-muted/20 p-5 text-center">
                  <Sparkles className="mx-auto size-6 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Unlock Custom Styling</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Custom brand colors, center logos, and frames require a Pro or Business plan.
                    </p>
                  </div>
                  <Button render={<Link href="/dashboard/billing" />} size="sm" variant="outline" className="mt-2">
                    Upgrade from {planName}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      {/* Sticky Studio Live Preview */}
      <FadeIn immediate delay={0.1} className="space-y-4">
        <div className="sticky top-20 space-y-4">
          <Card className="card-sheen elevated-card rounded-2xl border border-border/80 shadow-sm">
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="font-heading text-base font-bold">Live Studio Preview</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <QrPreview isDynamic={effectiveDynamic} payload={payload} design={design} />
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="w-full h-11 rounded-xl shadow-md shadow-primary/20 text-sm font-semibold"
            disabled={isPending}
          >
            {isPending ? "Saving..." : mode === "create" ? "Create QR code" : "Save changes"}
          </Button>
        </div>
      </FadeIn>
    </form>
  );
}
