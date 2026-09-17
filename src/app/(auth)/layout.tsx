import Link from "next/link";
import { QrCode, CheckCircle2, Sparkles, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh bg-background text-foreground">
      {/* Left Brand Story Panel (Desktop) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-border/80 bg-neutral-950 p-12 text-white lg:flex">
        {/* Background glow effects */}
        <div
          className="absolute -top-32 -left-32 size-[40rem] rounded-full bg-primary/20 blur-[120px]"
          aria-hidden
        />
        <div
          className="absolute -bottom-32 -right-32 size-[30rem] rounded-full bg-cyan-500/15 blur-[100px]"
          aria-hidden
        />
        <div className="dot-grid absolute inset-0 opacity-15" aria-hidden />

        {/* Top brand */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-[12px] bg-primary text-white shadow-md shadow-primary/30">
              <QrCode className="size-5" />
            </div>
            <span className="font-heading text-lg font-bold tracking-tight">QRForge</span>
          </Link>
        </div>

        {/* Center narrative & showcase */}
        <div className="relative z-10 max-w-lg space-y-8 my-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-semibold text-cyan-400 backdrop-blur-md">
            <Sparkles className="size-3.5" />
            Enterprise Dynamic QR Infrastructure
          </div>

          <h2 className="font-heading text-4xl font-extrabold leading-[1.1] tracking-tight">
            The dependable bridge between physical assets and digital experiences.
          </h2>

          {/* Testimonial Quote */}
          <div className="rounded-[20px] border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-3">
            <p className="text-sm italic leading-relaxed text-neutral-300">
              &ldquo;QRForge eliminated our packaging reprint delays entirely. We manage dynamic redirect targets across 45 countries with instant analytics and zero downtime.&rdquo;
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="size-9 rounded-full bg-gradient-to-tr from-primary to-cyan-400 flex items-center justify-center font-bold text-xs">
                EV
              </div>
              <div>
                <p className="text-xs font-bold text-white">Elena Vance</p>
                <p className="text-[11px] text-neutral-400">VP of Growth, Horizon Retail</p>
              </div>
            </div>
          </div>

          {/* Value props */}
          <div className="grid grid-cols-2 gap-3 text-xs font-medium text-neutral-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              <span>Sub-20ms Redirect Edge</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              <span>SOC-2 & GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              <span>Real-time Telemetry Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
              <span>High-Resolution Vector PDF/SVG</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="relative z-10 text-xs text-neutral-500">
          &copy; {new Date().getFullYear()} QRForge Platform, Inc. All rights reserved.
        </div>
      </div>

      {/* Right Form Container */}
      <div className="flex w-full flex-1 flex-col justify-between p-6 sm:p-10 lg:w-1/2">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Back to website
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        <div className="mx-auto w-full max-w-md py-8 my-auto">{children}</div>

        <div className="text-center text-xs text-muted-foreground">
          Protected by enterprise reCAPTCHA and bank-grade SSL encryption.
        </div>
      </div>
    </div>
  );
}
