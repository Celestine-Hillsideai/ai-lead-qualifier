import Stripe from "stripe";

// Lazily constructed so importing this module (e.g. at build time, when the
// route is compiled but never invoked) doesn't require STRIPE_SECRET_KEY to
// be set — the key is only needed once a request actually reaches a route
// that calls `stripe.*`.
let _stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe;
}
