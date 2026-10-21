import { z } from "zod";

import { sendGiftCardDeliveryEmail } from "@/lib/contact.server";
import { generateGiftCardPdf } from "@/lib/gift-card-pdf.server";
import { getStancerPaymentIntent, verifyStancerSignature } from "@/lib/stancer.server";

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
    design: z.enum([
      "ivory",
      "red",
      "green",
      "birthday",
      "thankYou",
      "congratulations",
      "cloudBirthday",
      "cloudThankYou",
      "cloudCongratulations",
    ]),
    occasion: z.enum(["christmas", "birthday", "congratulations", "thankYou"]).default("christmas"),
    from: z.string().min(1).max(40),
    recipient: z.string().min(1).max(40),
    message: z.string().min(1).max(100),
    email: z.string().email().max(255),
    locale: z.enum(["fr", "en", "de"]),
  }),
});

const RELEVANT_EVENTS = new Set([
  "payment.succeeded",
  "payment.updated",
  "payment_intent.updated",
  "payment_intent.captured",
]);
const DELIVERY_MEMORY_TTL_MS = 24 * 60 * 60 * 1000;
const deliveriesInProgress = new Set<string>();
const processedEvents = new Map<string, number>();
const deliveredPayments = new Map<string, number>();

function pruneDeliveryMemory(now: number) {
  for (const [id, timestamp] of processedEvents) {
    if (now - timestamp > DELIVERY_MEMORY_TTL_MS) processedEvents.delete(id);
  }
  for (const [id, timestamp] of deliveredPayments) {
    if (now - timestamp > DELIVERY_MEMORY_TTL_MS) deliveredPayments.delete(id);
  }
}

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
  if (!RELEVANT_EVENTS.has(event.data.type)) {
    console.info(`Ignored Stancer webhook event ${event.data.type}`);
    return new Response(null, { status: 204 });
  }

  const paymentIntentId = event.data.type.startsWith("payment_intent.")
    ? event.data.data.id
    : event.data.data.payment_intent;
  if (!paymentIntentId || !/^pi_[a-zA-Z0-9]{24}$/.test(paymentIntentId)) {
    return new Response(null, { status: 204 });
  }
  const now = Date.now();
  pruneDeliveryMemory(now);
  if (
    processedEvents.has(event.data.id) ||
    deliveredPayments.has(paymentIntentId) ||
    deliveriesInProgress.has(paymentIntentId)
  ) {
    return new Response(null, { status: 204 });
  }

  deliveriesInProgress.add(paymentIntentId);
  try {
    const paymentIntent = await getStancerPaymentIntent(paymentIntentId);
    if (paymentIntent.status !== "captured") return new Response(null, { status: 204 });
    if (paymentIntent.currency !== "eur" || !Number.isInteger(paymentIntent.amount)) {
      throw new Error("Unexpected Stancer payment intent amount or currency");
    }

    const metadata = metadataSchema.parse(paymentIntent.metadata);
    const documentData = {
      ...metadata.giftCard,
      amount: paymentIntent.amount / 100,
    };
    const pdf = await generateGiftCardPdf(documentData);
    await sendGiftCardDeliveryEmail(documentData, paymentIntentId, pdf);
    const deliveredAt = Date.now();
    processedEvents.set(event.data.id, deliveredAt);
    deliveredPayments.set(paymentIntentId, deliveredAt);
    console.info(
      `Gift card delivered for ${paymentIntentId} from Stancer event ${event.data.type}`,
    );

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(`Gift card webhook processing failed for ${paymentIntentId}`, error);
    return new Response("Processing failed", { status: 500 });
  } finally {
    deliveriesInProgress.delete(paymentIntentId);
  }
}
