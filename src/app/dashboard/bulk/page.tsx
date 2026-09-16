import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { canUseBulkGeneration } from "@/lib/plan-limits";
import { PLANS, type Plan } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BulkForm } from "./bulk-form";
import { FadeIn } from "@/components/motion/fade-in";
import { Upload, Sparkles, FileSpreadsheet } from "lucide-react";

export default async function BulkPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const plan = user.plan as Plan;
  const allowed = canUseBulkGeneration(plan);

  return (
    <div className="space-y-6">
      <FadeIn immediate y={10} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Bulk QR Generator
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Import a spreadsheet to generate hundreds of unique dynamic QR codes in a single batch.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <FileSpreadsheet className="size-3.5" />
          <span>Batch Processing</span>
        </div>
      </FadeIn>

      <FadeIn immediate delay={0.1}>
        {allowed ? (
          <BulkForm />
        ) : (
          <Card className="card-sheen rounded-2xl border border-border/80 shadow-xs">
            <CardContent className="space-y-4 p-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="size-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="font-heading text-lg font-bold text-foreground">Pro Feature: Bulk Batch Creation</h3>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Bulk CSV importation and automated zip exports are available on Pro and Business tiers.
                  Accelerate your packaging and venue deployments today.
                </p>
              </div>
              <Button render={<Link href="/dashboard/billing" />} size="sm" className="rounded-full px-5">
                Upgrade from {PLANS[plan].name}
              </Button>
            </CardContent>
          </Card>
        )}
      </FadeIn>
    </div>
  );
}
