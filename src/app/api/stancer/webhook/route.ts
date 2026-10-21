import { z } from "zod";

import { sendGiftCardDeliveryEmail } from "@/lib/contact.server";
import { generateGiftCardPdf } from "@/lib/gift-card-pdf.server";
import {
  getStancerPaymentIntent,
  markGiftCardDelivered,
  verifyStancerSignature,
} from "@/lib/stancer.server";

export const runtime = "nodejs";

const eventSchema = z.object({
  id: z.string().regex(/^evt_[a-zA-Z0-9]{24}$/),
  type: z.string(),
  data: z
    .object({
      id: z.string().optional(),
      payment_intent: z.string().optional(),
    })
    .passthrough(),
});

const metadataSchema = z.object({
  application: z.literal("welcome_gift_card"),
  version: z.literal(1),
  giftCard: z.object({
    design: z.enum(["ivory", "red", "green"]),
    from: z.string().min(1).max(100),
    recipient: z.string().min(1).max(100),
    message: z.string().min(1).max(1_000),
    email: z.string().email().max(255),
    locale: z.enum(["fr", "en", "de"]),
  }),
  delivery: z
    .object({
      sentAt: z.string().datetime(),
    })
    .optional(),
});

const RELEVANT_EVENTS = new Set([
  "payment.succeeded",
  "payment.updated",
  "payment_intent.updated",
  "payment_intent.captured",
]);

export async function POST(request: Request) {
  const payload = await request.text();

  try {
    if (!verifyStancerSignature(payload, request.headers.get("stancer-signature"))) {
      return new Response("Invalid signature", { status: 401 });
    }
  } catch (error) {
    console.error(error);
    return new Response("Webhook unavailable", { status: 503 });
  }

  let json: unknown;
  try {
    json = JSON.parse(payload);
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }

  const event = eventSchema.safeParse(json);
  if (!event.success) return new Response("Invalid payload", { status: 400 });
  if (!RELEVANT_EVENTS.has(event.data.type)) return new Response(null, { status: 204 });

  const paymentIntentId = event.data.type.startsWith("payment_intent.")
    ? event.data.data.id
    : event.data.data.payment_intent;
  if (!paymentIntentId || !/^pi_[a-zA-Z0-9]{24}$/.test(paymentIntentId)) {
    return new Response(null, { status: 204 });
  }

  try {
    const paymentIntent = await getStancerPaymentIntent(paymentIntentId);
    if (paymentIntent.status !== "captured") return new Response(null, { status: 204 });
    if (paymentIntent.currency !== "eur" || !Number.isInteger(paymentIntent.amount)) {
      throw new Error("Unexpected Stancer payment intent amount or currency");
    }

    const metadata = metadataSchema.parse(paymentIntent.metadata);
    if (metadata.delivery?.sentAt) return new Response(null, { status: 204 });

    const documentData = {
      ...metadata.giftCard,
      amount: paymentIntent.amount / 100,
    };
    const pdf = await generateGiftCardPdf(documentData);
    await sendGiftCardDeliveryEmail(documentData, paymentIntentId, pdf);
    await markGiftCardDelivered(paymentIntentId, metadata);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(`Gift card webhook processing failed for ${paymentIntentId}`, error);
    return new Response("Processing failed", { status: 500 });
  }
}
