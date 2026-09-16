import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { PLANS } from "@/lib/plans";
import { QrForm } from "../qr-form";
import { FadeIn } from "@/components/motion/fade-in";
import { ArrowLeft, Sparkles } from "lucide-react";

export default async function NewQrPage() {
  const user = await getCurrentUser();
  const plan = PLANS[(user?.plan as keyof typeof PLANS) ?? "FREE"];

  return (
    <div className="space-y-6">
      <FadeIn immediate y={10} className="space-y-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to QR Codes
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Create QR Code
            </h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Configure your payload destination, tune geometry and palette, then generate production-ready assets.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3" />
            Studio Builder
          </span>
        </div>
      </FadeIn>

      <QrForm mode="create" canCustomize={plan.customBranding} planName={plan.name} />
    </div>
  );
}
