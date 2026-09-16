"use server";

import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/session";
import { stripe, isBillingConfigured } from "@/lib/stripe";
import { PLANS } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

export async function createCheckoutSessionAction(plan: "PRO" | "BUSINESS") {
  if (!isBillingConfigured || !stripe) throw new Error("Billing is not configured yet.");
  const user = await requireCurrentUser();

  const priceEnvVar = PLANS[plan].stripePriceEnvVar;
  const priceId = priceEnvVar ? process.env[priceEnvVar] : undefined;
  if (!priceId) throw new Error(`Missing Stripe price ID for the ${plan} plan.`);

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?success=1`,
    cancel_url: `${appUrl}/dashboard/billing?canceled=1`,
    metadata: { userId: user.id, plan },
  });

  if (!session.url) throw new Error("Could not create checkout session.");
  redirect(session.url);
}

export async function createPortalSessionAction() {
  if (!isBillingConfigured || !stripe) throw new Error("Billing is not configured yet.");
  const user = await requireCurrentUser();
  if (!user.stripeCustomerId) throw new Error("No billing account found yet.");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl}/dashboard/billing`,
  });
  redirect(session.url);
}
