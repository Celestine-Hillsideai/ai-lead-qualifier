import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type PlanRow = {
  user_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status?: string;
  plan: "free" | "paid";
  updated_at: string;
};

async function upsertProfile(admin: ReturnType<typeof createAdminClient>, row: PlanRow) {
  const { error } = await admin.from("profiles").upsert(row, { onConflict: "user_id" });
  if (error) {
    console.error("[stripe webhook] profile upsert failed:", error, row);
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature ?? "", process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[stripe webhook] signature verification failed:", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const admin = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id ?? session.metadata?.supabase_user_id;
      if (!userId) {
        console.error("[stripe webhook] checkout.session.completed missing user id", session.id);
        break;
      }
      await upsertProfile(admin, {
        user_id: userId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        subscription_status: "active",
        plan: "paid",
        updated_at: new Date().toISOString(),
      });
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (!userId) {
        console.error("[stripe webhook] subscription event missing metadata", sub.id);
        break;
      }
      const plan = sub.status === "active" || sub.status === "trialing" ? "paid" : "free";
      await upsertProfile(admin, {
        user_id: userId,
        stripe_customer_id: sub.customer as string,
        stripe_subscription_id: sub.id,
        subscription_status: sub.status,
        plan,
        updated_at: new Date().toISOString(),
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (!userId) {
        console.error("[stripe webhook] subscription.deleted missing metadata", sub.id);
        break;
      }
      await upsertProfile(admin, {
        user_id: userId,
        subscription_status: "canceled",
        plan: "free",
        updated_at: new Date().toISOString(),
      });
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
