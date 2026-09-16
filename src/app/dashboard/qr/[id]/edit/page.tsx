import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { parseQrCode } from "@/lib/qr/service";
import { PLANS } from "@/lib/plans";
import { QrForm } from "../../qr-form";
import type { PayloadState } from "../../content-fields";

export default async function EditQrPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const qr = await prisma.qrCode.findFirst({ where: { id, ownerId: user.id } });
  if (!qr) notFound();

  const { payload, design } = parseQrCode(qr);
  const plan = PLANS[(user.plan as keyof typeof PLANS) ?? "FREE"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit QR code</h1>
      </div>
      <QrForm
        mode="edit"
        qrId={qr.id}
        initialName={qr.name}
        initialPayload={payload as unknown as PayloadState}
        initialDesign={design}
        initialIsDynamic={qr.isDynamic}
        canCustomize={plan.customBranding}
        planName={plan.name}
      />
    </div>
  );
}
