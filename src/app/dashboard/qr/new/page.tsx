import { getCurrentUser } from "@/lib/session";
import { PLANS } from "@/lib/plans";
import { QrForm } from "../qr-form";

export default async function NewQrPage() {
  const user = await getCurrentUser();
  const plan = PLANS[(user?.plan as keyof typeof PLANS) ?? "FREE"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create QR code</h1>
        <p className="text-sm text-muted-foreground">
          Choose a content type, customize the design, and save.
        </p>
      </div>
      <QrForm mode="create" canCustomize={plan.customBranding} planName={plan.name} />
    </div>
  );
}
