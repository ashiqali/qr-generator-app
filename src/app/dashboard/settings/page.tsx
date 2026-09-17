import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/plans";
import {
  ProfileForm,
  PasswordForm,
  NotificationSettings,
  BrandingSettings,
  DangerZone,
} from "./settings-forms";
import { FadeIn } from "@/components/motion/fade-in";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Shield,
  Bell,
  Palette,
  Sparkles,
  KeyRound,
  ArrowRight,
  Zap,
} from "lucide-react";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const planKey = (user.plan as keyof typeof PLANS) ?? "FREE";
  const plan = PLANS[planKey];

  const apiKeyCount = await prisma.apiKey.count({
    where: { ownerId: user.id, revokedAt: null },
  });

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <FadeIn immediate y={10}>
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Account & Workspace Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your personal profile, credentials, notifications, branding palette, and subscriptions.
          </p>
        </div>
      </FadeIn>

      {/* Tabs Hub */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full rounded-[16px] bg-muted/60 p-1">
          <TabsTrigger value="profile" className="rounded-[12px] text-xs font-semibold py-2">
            <User className="mr-1.5 size-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-[12px] text-xs font-semibold py-2">
            <Shield className="mr-1.5 size-3.5" /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-[12px] text-xs font-semibold py-2">
            <Bell className="mr-1.5 size-3.5" /> Alerts
          </TabsTrigger>
          <TabsTrigger value="branding" className="rounded-[12px] text-xs font-semibold py-2">
            <Palette className="mr-1.5 size-3.5" /> Branding
          </TabsTrigger>
          <TabsTrigger value="billing" className="rounded-[12px] text-xs font-semibold py-2">
            <Sparkles className="mr-1.5 size-3.5" /> Billing
          </TabsTrigger>
          <TabsTrigger value="api" className="rounded-[12px] text-xs font-semibold py-2">
            <KeyRound className="mr-1.5 size-3.5" /> API Keys
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile */}
        <TabsContent value="profile" className="space-y-6 outline-none">
          <ProfileForm name={user.name ?? ""} email={user.email} />
        </TabsContent>

        {/* Tab 2: Security */}
        <TabsContent value="security" className="space-y-6 outline-none">
          <PasswordForm hasPassword={Boolean(user.hashedPassword)} />
          <DangerZone />
        </TabsContent>

        {/* Tab 3: Notifications */}
        <TabsContent value="notifications" className="space-y-6 outline-none">
          <NotificationSettings />
        </TabsContent>

        {/* Tab 4: Branding */}
        <TabsContent value="branding" className="space-y-6 outline-none">
          <BrandingSettings />
        </TabsContent>

        {/* Tab 5: Billing Overview */}
        <TabsContent value="billing" className="space-y-6 outline-none">
          <Card className="rounded-[24px] border border-border/80 shadow-2xs">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <CardTitle className="font-heading text-lg font-bold">Subscription & Tier Details</CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Manage your active subscription plan, payment methods, and invoices.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5 max-w-xl">
              <div className="flex items-center justify-between rounded-[16px] border border-primary/30 bg-primary/5 p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Zap className="size-4 text-primary" />
                    <span className="font-heading font-extrabold text-foreground text-sm">
                      {plan.name} Plan Active
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ${plan.priceMonthly}/month • {plan.maxQrCodes === Infinity ? "Unlimited" : plan.maxQrCodes} active QR codes
                  </p>
                </div>
                <Button
                  render={<Link href="/dashboard/billing" />}
                  size="sm"
                  className="rounded-[12px] text-xs h-9 font-semibold"
                >
                  Manage Subscription &rarr;
                </Button>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                <p>Features included in your current plan:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: API Keys Overview */}
        <TabsContent value="api" className="space-y-6 outline-none">
          <Card className="rounded-[24px] border border-border/80 shadow-2xs">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="size-4 text-primary" />
                <CardTitle className="font-heading text-lg font-bold">REST API & Developer Access</CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Automate QR code creation and fetch real-time scan analytics programmatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5 max-w-xl">
              <div className="rounded-[16px] border border-border/80 bg-muted/20 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">Active API Tokens</p>
                  <p className="text-[11px] text-muted-foreground">
                    {apiKeyCount} key(s) generated in this workspace
                  </p>
                </div>
                <Button
                  render={<Link href="/dashboard/api-keys" />}
                  size="sm"
                  variant="outline"
                  className="rounded-[12px] text-xs h-9 font-semibold"
                >
                  Manage API Keys &rarr;
                </Button>
              </div>

              <div className="rounded-[16px] border border-border/80 bg-card p-4 space-y-2 text-xs">
                <p className="font-bold text-foreground">API Documentation</p>
                <p className="text-muted-foreground text-[11px]">
                  Explore endpoint schemas for batch creation, dynamic redirect updates, and telemetry webhooks.
                </p>
                <Link
                  href="/docs/api"
                  className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline pt-1"
                >
                  Browse API Docs <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
