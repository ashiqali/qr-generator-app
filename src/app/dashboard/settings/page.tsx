import { getCurrentUser } from "@/lib/session";
import { ProfileForm, PasswordForm, DangerZone } from "./settings-forms";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="max-w-xl space-y-6">
      <FadeIn immediate y={10}>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account.</p>
      </FadeIn>
      <StaggerContainer immediate className="space-y-6">
        <StaggerItem>
          <ProfileForm name={user.name ?? ""} email={user.email} />
        </StaggerItem>
        <StaggerItem>
          <PasswordForm hasPassword={Boolean(user.hashedPassword)} />
        </StaggerItem>
        <StaggerItem>
          <DangerZone />
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
