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
    <div className="space-y-6">
      <FadeIn immediate y={10}>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your subscription plan.</p>
      </FadeIn>

      {!isBillingConfigured && (
        <Alert>
          <AlertTitle>Billing isn&apos;t configured yet</AlertTitle>
          <AlertDescription>
            Add Stripe API keys and price IDs to your environment to enable upgrades. See the README
            for setup steps.
          </AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertTitle>Subscription updated</AlertTitle>
          <AlertDescription>
            Your plan will reflect the change shortly once Stripe confirms the payment.
          </AlertDescription>
        </Alert>
      )}
      {canceled && (
        <Alert variant="destructive">
          <AlertTitle>Checkout canceled</AlertTitle>
          <AlertDescription>No changes were made to your plan.</AlertDescription>
        </Alert>
      )}

      <StaggerContainer immediate className="grid gap-4 pt-3 md:grid-cols-3 md:items-start">
        {planOrder.map((planKey) => {
          const plan = PLANS[planKey];
          const isCurrent = planKey === currentPlan;

          return (
            <StaggerItem key={planKey}>
              <PlanCard
                plan={plan}
                featured={planKey === "PRO"}
                badge={isCurrent ? <Badge variant="secondary">Current</Badge> : undefined}
              >
                {planKey === "FREE" ? (
                  <Button className="w-full" variant="outline" disabled>
                    {isCurrent ? "Current plan" : "Downgrade via portal"}
                  </Button>
                ) : isCurrent ? (
                  <form action={createPortalSessionAction}>
                    <Button type="submit" className="w-full" variant="outline" disabled={!isBillingConfigured}>
                      Manage subscription
                    </Button>
                  </form>
                ) : (
                  <form action={createCheckoutSessionAction.bind(null, planKey as "PRO" | "BUSINESS")}>
                    <Button type="submit" className="w-full" disabled={!isBillingConfigured}>
                      Upgrade to {plan.name}
                    </Button>
                  </form>
                )}
              </PlanCard>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {user.stripeCustomerId && (
        <form action={createPortalSessionAction}>
          <Button type="submit" variant="link" className="px-0" disabled={!isBillingConfigured}>
            Manage billing details &amp; invoices
          </Button>
        </form>
      )}
    </div>
  );
}
