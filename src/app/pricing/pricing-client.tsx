"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { PLANS, type Plan } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { PlanCard } from "@/components/plan-card";
import {
  Check,
  Minus,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe2,
  Lock,
  HelpCircle,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";

const planOrder: Plan[] = ["FREE", "PRO", "BUSINESS"];

export function PricingClient() {
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const comparisonFeatures = [
    {
      category: "QR Generation",
      items: [
        { name: "Active Static QR Codes", free: "5 codes", pro: "Unlimited", business: "Unlimited" },
        { name: "Dynamic (Editable) QRs", free: "1 code", pro: "Unlimited", business: "Unlimited" },
        { name: "Vector SVG & High-Res PNG", free: true, pro: true, business: true },
        { name: "Print-Ready Vector PDF", free: false, pro: true, business: true },
      ],
    },
    {
      category: "Branding & Studio",
      items: [
        { name: "Custom Brand Colors & Themes", free: false, pro: true, business: true },
        { name: "Custom Center Logo Embed", free: false, pro: true, business: true },
        { name: "Frame Callouts & Badges", free: false, pro: true, business: true },
        { name: "Custom Redirect Short Domains", free: false, pro: false, business: true },
      ],
    },
    {
      category: "Telemetry & Performance",
      items: [
        { name: "Real-time Scan Tracking", free: "Basic", pro: "Full Telemetry", business: "Full Telemetry" },
        { name: "Device & Browser Analytics", free: false, pro: true, business: true },
        { name: "Geographic Country Origin", free: false, pro: true, business: true },
        { name: "Historical Data Retention", free: "7 days", pro: "1 Year", business: "Unlimited" },
      ],
    },
    {
      category: "Enterprise & Automation",
      items: [
        { name: "Bulk Spreadsheet CSV Upload", free: false, pro: true, business: true },
        { name: "REST API Access", free: false, pro: false, business: "Included" },
        { name: "API Keys per Account", free: "0", pro: "0", business: "Up to 10" },
        { name: "Priority Support & SLA", free: "Community", pro: "Priority Email", business: "24/7 Dedicated" },
      ],
    },
  ];

  const faqs = [
    {
      q: "Can I update the destination of a QR code after it is printed?",
      a: "Yes! All Dynamic QR codes can have their target URL or payload changed in real time via the studio dashboard without reprinting your flyers, packaging, or signage.",
    },
    {
      q: "Do dynamic QR codes ever expire?",
      a: "No. Your dynamic QR codes remain active and scannable for as long as your account is maintained. Even on the Free plan, your initial dynamic code never expires.",
    },
    {
      q: "What payment methods do you support?",
      a: "We process payments via Stripe, supporting all major credit cards (Visa, Mastercard, American Express), Apple Pay, Google Pay, and bank debits for enterprise tiers.",
    },
    {
      q: "Can I change my plan or cancel at any time?",
      a: "Absolutely. You can upgrade, downgrade, or cancel your subscription at any time directly from the self-serve billing portal with zero hidden fees.",
    },
    {
      q: "What happens if I exceed my scan quota?",
      a: "Your QR codes will never abruptly stop scanning. We will send you an automated email notification when you reach 80% and 100% of your plan thresholds with options to scale.",
    },
  ];

  return (
    <div className="space-y-20 py-12 sm:py-16">
      {/* Header & Billing Switch */}
      <FadeIn immediate className="mx-auto max-w-3xl text-center space-y-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
          <Sparkles className="size-3.5" />
          Transparent Enterprise Pricing
        </span>
        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Scale your QR infrastructure with confidence
        </h1>
        <p className="text-base text-muted-foreground max-w-xl mx-auto">
          Start free with no credit card required. Upgrade whenever your campaigns demand dynamic routing, custom branding, or API automation.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <div className="flex items-center rounded-full border border-border/80 bg-muted/60 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1.5 transition-all cursor-pointer ${
                !annual
                  ? "bg-card text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 transition-all cursor-pointer ${
                annual
                  ? "bg-card text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Annual Billing</span>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </FadeIn>

      {/* Plan Cards Grid */}
      <StaggerContainer immediate className="mx-auto max-w-6xl grid gap-6 md:grid-cols-3 items-stretch">
        {planOrder.map((key) => (
          <StaggerItem key={key} className="h-full">
            <PlanCard plan={PLANS[key]} featured={key === "PRO"} annual={annual}>
              <Button
                className={`w-full h-11 rounded-[14px] font-semibold ${
                  key === "PRO"
                    ? "bg-primary shadow-md shadow-primary/25 hover:bg-primary/90 text-primary-foreground"
                    : ""
                }`}
                variant={key === "PRO" ? "default" : "outline"}
                render={<Link href="/signup" />}
              >
                {key === "FREE" ? "Get started free" : `Upgrade to ${PLANS[key].name}`}
              </Button>
            </PlanCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Trust Indicators Banner */}
      <div className="mx-auto max-w-5xl rounded-[24px] border border-border/80 bg-muted/30 p-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 text-center">
          <div className="space-y-1">
            <ShieldCheck className="mx-auto size-6 text-primary" />
            <p className="font-heading font-bold text-foreground text-sm">99.9% Uptime SLA</p>
            <p className="text-[11px] text-muted-foreground">High-availability redirect edge</p>
          </div>
          <div className="space-y-1">
            <Lock className="mx-auto size-6 text-primary" />
            <p className="font-heading font-bold text-foreground text-sm">SOC-2 & GDPR Ready</p>
            <p className="text-[11px] text-muted-foreground">Privacy-first telemetry</p>
          </div>
          <div className="space-y-1">
            <Zap className="mx-auto size-6 text-primary" />
            <p className="font-heading font-bold text-foreground text-sm">&lt;20ms Redirects</p>
            <p className="text-[11px] text-muted-foreground">Global CDN edge routing</p>
          </div>
          <div className="space-y-1">
            <Globe2 className="mx-auto size-6 text-primary" />
            <p className="font-heading font-bold text-foreground text-sm">Worldwide Coverage</p>
            <p className="text-[11px] text-muted-foreground">Over 120 countries served</p>
          </div>
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Detailed Feature Comparison
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Compare all capabilities side-by-side to choose the best tier for your team.
          </p>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-border/80 bg-card shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40">
                <th className="p-4 font-bold uppercase tracking-wider text-foreground w-1/2">Features</th>
                <th className="p-4 font-bold uppercase tracking-wider text-muted-foreground text-center">Free</th>
                <th className="p-4 font-bold uppercase tracking-wider text-primary text-center">Pro</th>
                <th className="p-4 font-bold uppercase tracking-wider text-foreground text-center">Business</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((section) => (
                <Fragment key={section.category}>
                  <tr className="bg-muted/20 border-b border-border/60">
                    <td colSpan={4} className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                      {section.category}
                    </td>
                  </tr>
                  {section.items.map((item) => (
                    <tr key={item.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">
                        {typeof item.free === "boolean" ? (
                          item.free ? <Check className="mx-auto size-4 text-primary" /> : <Minus className="mx-auto size-3.5 opacity-40" />
                        ) : (
                          item.free
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-foreground">
                        {typeof item.pro === "boolean" ? (
                          item.pro ? <Check className="mx-auto size-4 text-primary" /> : <Minus className="mx-auto size-3.5 opacity-40" />
                        ) : (
                          item.pro
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-foreground">
                        {typeof item.business === "boolean" ? (
                          item.business ? <Check className="mx-auto size-4 text-primary" /> : <Minus className="mx-auto size-3.5 opacity-40" />
                        ) : (
                          item.business
                        )}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="text-center space-y-2">
          <HelpCircle className="mx-auto size-6 text-primary" />
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Everything you need to know about plans, billing, and dynamic QR routing.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={faq.q}
                className="overflow-hidden rounded-[18px] border border-border/80 bg-card transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-4.5 text-left text-xs sm:text-sm font-semibold text-foreground transition-colors hover:text-primary cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-border/60 bg-muted/20 px-4.5 py-3 text-xs leading-relaxed text-muted-foreground">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Final CTA Banner */}
      <div className="mx-auto max-w-5xl rounded-[28px] bg-primary p-8 sm:p-12 text-center text-primary-foreground shadow-xl shadow-primary/20 space-y-4">
        <h3 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
          Ready to deploy your next QR campaign?
        </h3>
        <p className="max-w-xl mx-auto text-xs sm:text-sm text-primary-foreground/80">
          Join thousands of modern businesses who rely on QRForge for dependable campaigns and instant telemetry.
        </p>
        <Button
          size="lg"
          className="h-11 rounded-[14px] bg-white text-primary hover:bg-neutral-100 font-bold px-6 shadow-md"
          render={<Link href="/signup" />}
        >
          Start Generating Free <ArrowRight className="ml-1.5 size-4" />
        </Button>
      </div>
    </div>
  );
}
