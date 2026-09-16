import Link from "next/link";
import {
  BarChart3,
  Braces,
  Palette,
  QrCode,
  Upload,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingHeader } from "@/components/marketing-header";
import { MarketingFooter } from "@/components/marketing-footer";
import { GlowGridBg } from "@/components/glow-grid-bg";
import { HeroQrVisual } from "@/components/hero-qr-visual";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";
import { HoverLift } from "@/components/motion/hover-lift";

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col">
      <MarketingHeader />
      <main className="flex-1">
        <section className="relative">
          <GlowGridBg />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-16 pb-24 sm:pt-20 lg:grid-cols-2 lg:gap-8">
            <StaggerContainer immediate className="text-center lg:text-left">
              <StaggerItem className="mb-5 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                <QrCode className="size-3.5 text-primary" />
                Trusted QR infrastructure for growing teams
              </StaggerItem>
              <StaggerItem>
                <h1 className="text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl">
                  QR codes that grow with your business
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="mt-5 text-lg text-muted-foreground text-balance">
                  Generate branded, trackable QR codes in seconds. Start free, upgrade for dynamic
                  codes, analytics, bulk generation and API access.
                </p>
              </StaggerItem>
              <StaggerItem className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <Button size="lg" className="w-full sm:w-auto" render={<Link href="/signup" />}>
                  Start for free
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" render={<Link href="/pricing" />}>
                  View pricing
                </Button>
              </StaggerItem>
              <StaggerItem className="mt-4 text-xs text-muted-foreground">
                No credit card required · 5 QR codes free forever
              </StaggerItem>
            </StaggerContainer>

            <HeroQrVisual />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <FadeIn className="mb-10 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything a QR program needs
            </h2>
            <p className="mt-2 text-muted-foreground">
              Not just an image generator — a full toolkit for print, product and marketing teams.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-[auto_auto]">
            <StaggerItem className="md:col-span-2 md:row-span-2">
              <HoverLift className="h-full" lift={4}>
                <article className="group flex h-full flex-col gap-4 rounded-2xl border bg-card p-8 shadow-sm transition-shadow hover:shadow-lg">
                  <FeatureIcon icon={QrCode} />
                  <h3 className="max-w-[20ch] text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
                    Dynamic QR codes you can edit and track after they&apos;re printed
                  </h3>
                  <p className="mt-auto max-w-[46ch] pt-8 text-sm leading-relaxed text-muted-foreground">
                    Change the destination anytime without reprinting. Every scan is logged with
                    device, location and time — see it all in{" "}
                    <span className="inline-flex items-center gap-1 font-medium text-foreground">
                      <BarChart3 className="size-4" /> real-time analytics
                    </span>
                    .
                  </p>
                </article>
              </HoverLift>
            </StaggerItem>

            <StaggerItem>
              <HoverLift className="h-full" lift={4}>
                <article className="flex h-full flex-col gap-3 rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-lg">
                  <FeatureIcon icon={Palette} size="sm" />
                  <h3 className="font-medium">Custom branding</h3>
                  <p className="text-sm text-muted-foreground">
                    Your colors, dot styles, logo, and a call-to-action frame.
                  </p>
                </article>
              </HoverLift>
            </StaggerItem>

            <StaggerItem>
              <HoverLift className="h-full" lift={4}>
                <article className="flex h-full flex-col gap-3 rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-lg">
                  <FeatureIcon icon={Upload} size="sm" />
                  <h3 className="font-medium">Bulk generation</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a CSV and generate hundreds of QR codes in one go.
                  </p>
                </article>
              </HoverLift>
            </StaggerItem>

            <StaggerItem className="md:col-span-2">
              <HoverLift className="h-full" lift={4}>
                <article className="flex h-full items-center justify-between gap-6 rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-lg">
                  <div className="flex items-center gap-4">
                    <FeatureIcon icon={Braces} size="sm" />
                    <div>
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        For developers
                      </p>
                      <h3 className="mt-1 text-base font-medium">
                        A REST API to create and manage QR codes programmatically.
                      </h3>
                    </div>
                  </div>
                  <Link
                    href="/docs/api"
                    className="shrink-0 text-sm font-medium whitespace-nowrap text-primary hover:underline"
                  >
                    API docs →
                  </Link>
                </article>
              </HoverLift>
            </StaggerItem>

            <StaggerItem>
              <HoverLift className="h-full" lift={4}>
                <article className="flex h-full flex-col gap-3 rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-lg">
                  <FeatureIcon icon={Wifi} size="sm" />
                  <h3 className="font-medium">Every content type</h3>
                  <p className="text-sm text-muted-foreground">
                    URLs, WiFi, vCards, email, SMS, app links, and PDFs.
                  </p>
                </article>
              </HoverLift>
            </StaggerItem>
          </StaggerContainer>
        </section>

        <FadeIn className="mx-auto max-w-4xl px-6 pb-24 text-center">
          <div className="relative overflow-hidden rounded-2xl border bg-card py-14 shadow-sm">
            <div
              aria-hidden
              className="absolute inset-0 -z-10"
              style={{ background: "radial-gradient(ellipse 60% 100% at 50% 0%, var(--accent), transparent)" }}
            />
            <h2 className="text-2xl font-semibold">Ready to create your first QR code?</h2>
            <p className="mt-2 text-muted-foreground">Free plan includes 5 QR codes, no credit card required.</p>
            <Button size="lg" className="mt-6" render={<Link href="/signup" />}>
              Get started
            </Button>
          </div>
        </FadeIn>
      </main>
      <MarketingFooter />
    </div>
  );
}

function FeatureIcon({ icon: Icon, size = "lg" }: { icon: typeof QrCode; size?: "sm" | "lg" }) {
  return (
    <div
      className={
        size === "lg"
          ? "flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
          : "flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
      }
    >
      <Icon className={size === "lg" ? "size-6" : "size-5"} />
    </div>
  );
}
