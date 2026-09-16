import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, isBillingConfigured } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type { Plan } from "@/lib/plans";

export async function POST(request: Request) {
  if (!isBillingConfigured || !stripe) {
    return NextResponse.json({ error: "Billing not configured" }, { status: 400 });
  }

  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const planHint = session.metadata?.plan as Plan | undefined;
      if (userId && typeof session.subscription === "string") {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        await syncSubscription(userId, subscription, planHint);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const user = await prisma.user.findFirst({ where: { stripeSubscriptionId: subscription.id } });
      if (user) await syncSubscription(user.id, subscription);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

async function syncSubscription(userId: string, subscription: Stripe.Subscription, planHint?: Plan) {
  const status = subscription.status;
  const isActive = status === "active" || status === "trialing";
  const item = subscription.items.data[0];
  const plan: Plan = isActive ? (planHint ?? inferPlanFromPriceId(item?.price.id)) : "FREE";

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan,
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionStatus: status,
      stripePriceId: item?.price.id,
      stripeCurrentPeriodEnd: item ? new Date(item.current_period_end * 1000) : undefined,
    },
  });
}

function inferPlanFromPriceId(priceId?: string): Plan {
  if (priceId && priceId === process.env.STRIPE_PRICE_ID_BUSINESS) return "BUSINESS";
  if (priceId && priceId === process.env.STRIPE_PRICE_ID_PRO) return "PRO";
  return "FREE";
}
