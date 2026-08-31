import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/subscription";

interface ErrorBody {
  ok: false;
  error: { code: "UNAUTHENTICATED" | "ALREADY_SUBSCRIBED" | "CHECKOUT_FAILED"; message: string };
}

function errorResponse(status: number, code: ErrorBody["error"]["code"], message: string) {
  return NextResponse.json<ErrorBody>({ ok: false, error: { code, message } }, { status });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return errorResponse(401, "UNAUTHENTICATED", "Sign in to upgrade.");
  }

  const profile = await getUserProfile(supabase, user.id);
  if (profile.plan === "paid") {
    return errorResponse(400, "ALREADY_SUBSCRIBED", "You're already on the paid plan.");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      customer: profile.stripeCustomerId ?? undefined,
      customer_email: profile.stripeCustomerId ? undefined : (user.email ?? undefined),
      client_reference_id: user.id,
      subscription_data: { metadata: { supabase_user_id: user.id } },
      success_url: `${appUrl}/billing?checkout=success`,
      cancel_url: `${appUrl}/billing?checkout=cancelled`,
    });

    if (!session.url) {
      return errorResponse(500, "CHECKOUT_FAILED", "Stripe didn't return a checkout URL.");
    }

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("[stripe checkout] session creation failed:", err);
    return errorResponse(500, "CHECKOUT_FAILED", "Couldn't start checkout. Try again shortly.");
  }
}
