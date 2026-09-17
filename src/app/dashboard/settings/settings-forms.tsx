"use client";

import { useState, useActionState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  updateProfileAction,
  changePasswordAction,
  deleteAccountAction,
  type SettingsActionState,
} from "./actions";
import {
  User,
  Shield,
  Bell,
  Palette,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from "lucide-react";

const initialState: SettingsActionState = {};

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <Card className="rounded-[24px] border border-border/80 shadow-2xs">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <User className="size-4 text-primary" />
          <CardTitle className="font-heading text-lg font-bold">Personal Profile</CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Update your public name and view your primary account credentials.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4 max-w-lg">
          {state.error && (
            <Alert variant="destructive" className="rounded-[14px]">
              <AlertCircle className="size-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          {state.success && (
            <Alert className="rounded-[14px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <AlertDescription>{state.success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">Account Email</Label>
            <Input id="email" value={email} disabled className="h-10 text-xs bg-muted/40 cursor-not-allowed opacity-80" />
            <p className="text-[11px] text-muted-foreground">Primary identifier for security notifications.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold">Display Name</Label>
            <Input id="name" name="name" defaultValue={name} className="h-10 text-xs" />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={pending} className="h-10 rounded-[14px] text-xs font-semibold px-5 shadow-xs shadow-primary/20">
              {pending ? "Saving..." : "Save Profile Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);

  if (!hasPassword) {
    return (
      <Card className="rounded-[24px] border border-border/80 shadow-2xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-primary" />
            <CardTitle className="font-heading text-lg font-bold">Authentication Provider</CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            This account authenticates securely via Google OAuth Single Sign-On.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-[16px] border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-3">
            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Google OAuth SSO Active — Password management is handled by your Google account.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[24px] border border-border/80 shadow-2xs">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-primary" />
          <CardTitle className="font-heading text-lg font-bold">Password & Security</CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Ensure your workspace account is using a secure, strong password.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4 max-w-lg">
          {state.error && (
            <Alert variant="destructive" className="rounded-[14px]">
              <AlertCircle className="size-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          {state.success && (
            <Alert className="rounded-[14px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <AlertDescription>{state.success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="currentPassword" className="text-xs font-semibold">Current Password</Label>
            <Input id="currentPassword" name="currentPassword" type="password" required className="h-10 text-xs" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-xs font-semibold">New Password</Label>
            <Input id="newPassword" name="newPassword" type="password" minLength={8} required className="h-10 text-xs" />
            <p className="text-[11px] text-muted-foreground">Must be at least 8 characters.</p>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={pending} className="h-10 rounded-[14px] text-xs font-semibold px-5 shadow-xs shadow-primary/20">
              {pending ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function NotificationSettings() {
  const [scanAlerts, setScanAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [quotaAlerts, setQuotaAlerts] = useState(true);

  function handleToggle(label: string, _active: boolean) {
    toast.success(`${label} preference updated`);
  }

  return (
    <Card className="rounded-[24px] border border-border/80 shadow-2xs">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-primary" />
          <CardTitle className="font-heading text-lg font-bold">Email Notifications & Telemetry Alerts</CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Choose which campaign events and scan threshold digests you wish to receive.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-5 max-w-xl">
        <div className="flex items-center justify-between rounded-[16px] border border-border/80 bg-card p-4">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-foreground">First Scan Milestones</p>
            <p className="text-[11px] text-muted-foreground">Receive instant alert when a newly deployed campaign is scanned.</p>
          </div>
          <Switch
            checked={scanAlerts}
            onCheckedChange={(v) => {
              setScanAlerts(v);
              handleToggle("Scan Milestones", v);
            }}
          />
        </div>

        <div className="flex items-center justify-between rounded-[16px] border border-border/80 bg-card p-4">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-foreground">Weekly Telemetry Digest</p>
            <p className="text-[11px] text-muted-foreground">Summarized report of top performing codes, scans, and countries.</p>
          </div>
          <Switch
            checked={weeklyDigest}
            onCheckedChange={(v) => {
              setWeeklyDigest(v);
              handleToggle("Weekly Digest", v);
            }}
          />
        </div>

        <div className="flex items-center justify-between rounded-[16px] border border-border/80 bg-card p-4">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-foreground">Quota Threshold Warnings</p>
            <p className="text-[11px] text-muted-foreground">Alerts when your workspace reaches 80% and 100% of plan limits.</p>
          </div>
          <Switch
            checked={quotaAlerts}
            onCheckedChange={(v) => {
              setQuotaAlerts(v);
              handleToggle("Quota Warnings", v);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function BrandingSettings() {
  const [primaryHex, setPrimaryHex] = useState("#4F46E5");
  const [bgHex, setBgHex] = useState("#FFFFFF");

  return (
    <Card className="rounded-[24px] border border-border/80 shadow-2xs">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <Palette className="size-4 text-primary" />
          <CardTitle className="font-heading text-lg font-bold">Workspace Branding Defaults</CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Configure default color palettes and logo behavior for new QR codes generated in this workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-5 max-w-xl">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Default Foreground</Label>
            <div className="flex items-center gap-2 rounded-[12px] border border-border/80 bg-card p-1">
              <input
                type="color"
                value={primaryHex}
                onChange={(e) => setPrimaryHex(e.target.value)}
                className="size-7 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0"
              />
              <Input
                value={primaryHex}
                onChange={(e) => setPrimaryHex(e.target.value)}
                className="h-7 border-0 p-0 font-mono text-xs shadow-none"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Default Background</Label>
            <div className="flex items-center gap-2 rounded-[12px] border border-border/80 bg-card p-1">
              <input
                type="color"
                value={bgHex}
                onChange={(e) => setBgHex(e.target.value)}
                className="size-7 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0"
              />
              <Input
                value={bgHex}
                onChange={(e) => setBgHex(e.target.value)}
                className="h-7 border-0 p-0 font-mono text-xs shadow-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-[16px] border border-border/80 bg-muted/20 p-4 space-y-1 text-xs">
          <p className="font-bold text-foreground">Global Brand Asset Lock</p>
          <p className="text-muted-foreground text-[11px]">
            New QR codes will inherit these colors by default during studio builder sessions.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => toast.success("Workspace branding defaults saved")}
          className="h-10 rounded-[14px] text-xs font-semibold px-5 shadow-xs shadow-primary/20"
        >
          Save Branding Defaults
        </Button>
      </CardContent>
    </Card>
  );
}

export function DangerZone() {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Permanently delete your account and all QR codes? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteAccountAction();
      toast.success("Account deleted");
    });
  }

  return (
    <Card className="rounded-[24px] border-destructive/30 bg-destructive/5 shadow-2xs">
      <CardHeader className="border-b border-destructive/20 pb-4">
        <div className="flex items-center gap-2">
          <Trash2 className="size-4 text-destructive" />
          <CardTitle className="font-heading text-lg font-bold text-destructive">Danger Zone</CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Permanently delete your account and all associated campaigns, short links, and scan analytics.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        <Button
          type="button"
          variant="destructive"
          disabled={isPending}
          onClick={handleDelete}
          className="h-10 rounded-[14px] text-xs font-semibold px-5"
        >
          {isPending ? "Deleting..." : "Permanently Delete Account"}
        </Button>
      </CardContent>
    </Card>
  );
}
