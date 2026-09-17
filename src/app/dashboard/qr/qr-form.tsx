"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ContentFields, defaultPayloadForType, type PayloadState } from "./content-fields";
import { DesignFields } from "./design-fields";
import { QrPreview } from "./qr-preview";
import { QR_TYPE_META, QrTypeIcon } from "./qr-type-icon";
import { createQrAction, updateQrAction } from "./actions";
import { DEFAULT_DESIGN, DYNAMIC_ONLY_TYPES, type QrContentType, type QrDesign } from "@/lib/qr/types";
import { Radio, Sparkles, Layers, Sliders, ArrowLeft, Check, Globe } from "lucide-react";

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
    if (mode === "edit") return;
    setPayload(defaultPayloadForType(type));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Campaign name is required.");
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
      toast.success(mode === "create" ? "QR code created successfully" : "QR code updated");
      router.push(`/dashboard/qr/${result.id}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive" className="rounded-[16px]">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 3-Column Studio Builder Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: QR Types Selector */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="rounded-[24px] border border-border/80 bg-card/70 backdrop-blur-md p-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <Globe className="size-4 text-primary" />
              <h2 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Destination Type
              </h2>
            </div>

            <div className="mt-3 flex flex-col gap-1.5 max-h-[580px] overflow-y-auto pr-1">
              {Object.entries(QR_TYPE_META).map(([typeKey, meta]) => {
                const isSelected = payload.type === typeKey;
                const isDynamicOnly = DYNAMIC_ONLY_TYPES.includes(typeKey as QrContentType);

                return (
                  <button
                    key={typeKey}
                    type="button"
                    disabled={mode === "edit"}
                    onClick={() => handleTypeChange(typeKey as QrContentType)}
                    className={`group flex items-center justify-between gap-2.5 rounded-[14px] p-2.5 text-left transition-all cursor-pointer outline-none ${
                      isSelected
                        ? "border border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/25"
                        : "border border-transparent hover:border-border/80 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    } ${mode === "edit" ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-[10px] transition-transform group-hover:scale-105 ${
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-2xs"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <QrTypeIcon type={typeKey as QrContentType} className="size-4" />
                      </div>
                      <div className="truncate">
                        <p
                          className={`text-xs font-semibold truncate ${
                            isSelected ? "text-primary dark:text-white" : "text-foreground"
                          }`}
                        >
                          {meta.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">{meta.description}</p>
                      </div>
                    </div>

                    {isDynamicOnly ? (
                      <span className="shrink-0 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                        Dynamic
                      </span>
                    ) : isSelected ? (
                      <Check className="size-4 shrink-0 text-primary" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Center Column: Large Preview Canvas */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-20">
            <QrPreview isDynamic={effectiveDynamic} payload={payload} design={design} />
          </div>
        </div>

        {/* Right Column: Settings & Configuration Tabs */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="rounded-[24px] border border-border/80 bg-card p-5 shadow-2xs">
            {/* Campaign Name Field */}
            <div className="space-y-2 pb-5 border-b border-border/60">
              <Label htmlFor="qr-name" className="text-xs font-bold">Campaign Name</Label>
              <Input
                id="qr-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Summer Festival 2026 Poster"
                className="h-10 text-xs font-medium"
              />
            </div>

            {/* Customization Tabs */}
            <Tabs defaultValue="content" className="mt-4">
              <TabsList className="grid grid-cols-2 w-full rounded-[12px] bg-muted/60 p-1">
                <TabsTrigger value="content" className="rounded-[10px] text-xs font-semibold">
                  <Layers className="mr-1.5 size-3.5" /> Content
                </TabsTrigger>
                <TabsTrigger value="design" className="rounded-[10px] text-xs font-semibold">
                  <Sliders className="mr-1.5 size-3.5" /> Geometry
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Content & Destination */}
              <TabsContent value="content" className="pt-4 space-y-5">
                <ContentFields payload={payload} onChange={setPayload} />

                {/* Dynamic Tracking Switch Card */}
                <div className="rounded-[16px] border border-border/80 bg-muted/30 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="size-4 text-primary" />
                      <div>
                        <Label htmlFor="dynamic-toggle" className="text-xs font-bold text-foreground">
                          Dynamic Tracking & Routing
                        </Label>
                        <p className="text-[10px] text-muted-foreground">
                          Change destination URL anytime without reprinting
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="dynamic-toggle"
                      checked={effectiveDynamic}
                      onCheckedChange={setIsDynamic}
                      disabled={dynamicForced}
                    />
                  </div>
                  {dynamicForced && (
                    <p className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                      * This content format requires a dynamic redirect short-link.
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* Tab 2: Visual Geometry & Branding */}
              <TabsContent value="design" className="pt-4 space-y-5">
                {canCustomize ? (
                  <DesignFields design={design} onChange={setDesign} />
                ) : (
                  <div className="space-y-3 rounded-[16px] border border-dashed border-border/80 bg-muted/20 p-5 text-center">
                    <Sparkles className="mx-auto size-6 text-primary" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Custom Palette & Brand Mark</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Custom colors, logos, and frame banners are enabled on Pro and Business tiers.
                      </p>
                    </div>
                    <Button
                      render={<Link href="/dashboard/billing" />}
                      size="sm"
                      variant="outline"
                      className="mt-2 text-xs rounded-[12px]"
                    >
                      Upgrade from {planName}
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>

          {/* Action CTA Card */}
          <Card className="rounded-[20px] border border-border/80 bg-card p-4 shadow-2xs">
            <div className="space-y-3">
              <Button
                type="submit"
                size="lg"
                className="w-full h-11 rounded-[14px] text-sm font-semibold shadow-xs shadow-primary/25 hover:shadow-md hover:shadow-primary/30"
                disabled={isPending}
              >
                {isPending
                  ? "Publishing..."
                  : mode === "create"
                    ? "Generate & Save QR Code"
                    : "Update Campaign"}
              </Button>

              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <Link
                  href="/dashboard"
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="size-3" /> Cancel
                </Link>
                <span className="font-mono text-[10px]">Ready for export</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
