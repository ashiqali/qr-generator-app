import Link from "next/link";
import { PLANS, type Plan } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { PlanCard } from "@/components/plan-card";
import { MarketingHeader } from "@/components/marketing-header";
import { MarketingFooter } from "@/components/marketing-footer";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";

const planOrder: Plan[] = ["FREE", "PRO", "BUSINESS"];

export default function PricingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <MarketingHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <FadeIn immediate className="mb-14 text-center">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Simple, transparent pricing
            </h1>
            <p className="mt-3 text-muted-foreground">Start free. Upgrade when you need more.</p>
          </FadeIn>
          <StaggerContainer immediate className="grid gap-4 md:grid-cols-3 md:items-start">
            {planOrder.map((key) => (
              <StaggerItem key={key}>
                <PlanCard plan={PLANS[key]} featured={key === "PRO"}>
                  <Button className="w-full" variant={key === "PRO" ? "default" : "outline"} render={<Link href="/signup" />}>
                    {key === "FREE" ? "Start for free" : `Choose ${PLANS[key].name}`}
                  </Button>
                </PlanCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
