import { MarketingHeader } from "@/components/marketing-header";
import { MarketingFooter } from "@/components/marketing-footer";
import { PricingClient } from "./pricing-client";

export default function PricingPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <MarketingHeader />
      <main className="flex-1 px-6">
        <PricingClient />
      </main>
      <MarketingFooter />
    </div>
  );
}
