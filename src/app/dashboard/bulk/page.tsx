import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { canUseBulkGeneration } from "@/lib/plan-limits";
import { PLANS, type Plan } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BulkForm } from "./bulk-form";
import { FadeIn } from "@/components/motion/fade-in";

export default async function BulkPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const plan = user.plan as Plan;
  const allowed = canUseBulkGeneration(plan);

  return (
    <div className="space-y-6">
      <FadeIn immediate y={10}>
        <h1 className="text-2xl font-semibold">Bulk Generate</h1>
        <p className="text-sm text-muted-foreground">Upload a CSV to create many QR codes at once.</p>
      </FadeIn>

      <FadeIn immediate delay={0.1}>
        {allowed ? (
          <BulkForm />
        ) : (
          <Card>
            <CardContent className="space-y-3 pt-6 text-sm">
              <p>Bulk generation requires the Pro plan or higher.</p>
              <Button render={<Link href="/dashboard/billing" />} size="sm">
                Upgrade from {PLANS[plan].name}
              </Button>
            </CardContent>
          </Card>
        )}
      </FadeIn>
    </div>
  );
}
