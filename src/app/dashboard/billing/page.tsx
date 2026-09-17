import { getCurrentUser } from "@/lib/session";
import { isBillingConfigured } from "@/lib/stripe";
import { PLANS, type Plan } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlanCard } from "@/components/plan-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createCheckoutSessionAction, createPortalSessionAction } from "./actions";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";
import { Sparkles, CheckCircle2, AlertTriangle, CreditCard } from "lucide-react";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const { success, canceled } = await searchParams;
  const user = await getCurrentUser();
  if (!user) return null;

  const currentPlan = (user.plan as Plan) ?? "FREE";
  const planOrder: Plan[] = ["FREE", "PRO", "BUSINESS"];

  return (
    <div className="space-y-8 max-w-6xl">
      <FadeIn immediate y={10}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Subscription & Invoicing
              </h1>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                {PLANS[currentPlan].name} Tier
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Manage your workspace plan limits, payment methods, and monthly usage ceilings.
            </p>
          </div>

          {user.stripeCustomerId && (
            <form action={createPortalSessionAction}>
              <Button
                type="submit"
                variant="outline"
                disabled={!isBillingConfigured}
                className="rounded-[14px] text-xs h-9 font-semibold"
              >
                <CreditCard className="mr-1.5 size-3.5" />
                Customer Invoicing Portal &rarr;
              </Button>
            </form>
          )}
        </div>
      </FadeIn>

      {!isBillingConfigured && (
        <Alert className="rounded-[18px] border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300">
          <AlertTriangle className="size-4 text-amber-500" />
          <AlertTitle className="font-bold text-xs">Stripe Billing in Demonstration Mode</AlertTitle>
          <AlertDescription className="text-xs">
            Add Stripe API keys and price IDs to your environment to enable real payments. Upgrade actions will render gracefully.
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="rounded-[18px] border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="size-4 text-emerald-500" />
          <AlertTitle className="font-bold text-xs">Subscription Confirmed</AlertTitle>
          <AlertDescription className="text-xs">
            Your new plan limits will reflect across your workspace shortly once Stripe confirms the transaction.
          </AlertDescription>
        </Alert>
      )}

      {canceled && (
        <Alert variant="destructive" className="rounded-[18px] text-xs">
          <AlertTitle className="font-bold">Checkout Session Aborted</AlertTitle>
          <AlertDescription>No changes were made to your active subscription plan.</AlertDescription>
        </Alert>
      )}

      <StaggerContainer immediate className="grid gap-6 md:grid-cols-3 items-stretch pt-2">
        {planOrder.map((planKey) => {
          const plan = PLANS[planKey];
          const isCurrent = planKey === currentPlan;

          return (
            <StaggerItem key={planKey} className="h-full">
              <PlanCard
                plan={plan}
                featured={planKey === "PRO"}
                badge={isCurrent ? <Badge variant="secondary" className="rounded-full text-[10px] font-bold">Active Plan</Badge> : undefined}
              >
                {planKey === "FREE" ? (
                  <Button className="w-full h-11 rounded-[14px] font-semibold text-xs" variant="outline" disabled>
                    {isCurrent ? "Current Plan Active" : "Included by Default"}
                  </Button>
                ) : isCurrent ? (
                  <form action={createPortalSessionAction}>
                    <Button
                      type="submit"
                      className="w-full h-11 rounded-[14px] font-semibold text-xs"
                      variant="outline"
                      disabled={!isBillingConfigured}
                    >
                      Manage Plan on Stripe
                    </Button>
                  </form>
                ) : (
                  <form action={createCheckoutSessionAction.bind(null, planKey as "PRO" | "BUSINESS")}>
                    <Button
                      type="submit"
                      className={`w-full h-11 rounded-[14px] font-semibold text-xs ${
                        planKey === "PRO" ? "shadow-md shadow-primary/25" : ""
                      }`}
                      disabled={!isBillingConfigured}
                    >
                      <Sparkles className="mr-1.5 size-3.5" />
                      Upgrade to {plan.name}
                    </Button>
                  </form>
                )}
              </PlanCard>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </div>
  );
}
