import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PLANS, type Plan } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ApiKeysClient } from "./api-keys-client";
import { FadeIn } from "@/components/motion/fade-in";

export default async function ApiKeysPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const plan = user.plan as Plan;
  const planConfig = PLANS[plan];

  if (!planConfig.apiAccess) {
    return (
      <div className="space-y-6">
        <FadeIn immediate y={10}>
          <h1 className="text-2xl font-semibold">API Keys</h1>
          <p className="text-sm text-muted-foreground">Programmatic access to create and manage QR codes.</p>
        </FadeIn>
        <FadeIn immediate delay={0.1}>
          <Card>
            <CardContent className="space-y-3 pt-6 text-sm">
              <p>REST API access requires the Business plan.</p>
              <Button render={<Link href="/dashboard/billing" />} size="sm">
                Upgrade from {planConfig.name}
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    );
  }

  const keys = await prisma.apiKey.findMany({
    where: { ownerId: user.id, revokedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <FadeIn immediate y={10}>
        <h1 className="text-2xl font-semibold">API Keys</h1>
        <p className="text-sm text-muted-foreground">
          Use these keys to call the REST API. See{" "}
          <Link href="/docs/api" className="text-primary underline underline-offset-4">
            API docs
          </Link>
          .
        </p>
      </FadeIn>
      <FadeIn immediate delay={0.1}>
        <ApiKeysClient
          initialKeys={keys.map((k) => ({
            id: k.id,
            label: k.label,
            keyPrefix: k.keyPrefix,
            createdAt: k.createdAt.toISOString(),
            lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
          }))}
          remaining={Math.max(0, planConfig.maxApiKeys - keys.length)}
        />
      </FadeIn>
    </div>
  );
}
