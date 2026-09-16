import "server-only";
import Stripe from "stripe";

export const isBillingConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
