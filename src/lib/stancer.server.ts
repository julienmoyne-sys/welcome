import "server-only";

import { randomUUID } from "node:crypto";

const STANCER_API_URL = "https://api.stancer.com/v2";

type StancerCustomer = {
  id: string;
};

type StancerPaymentIntent = {
  id: string;
  url: string;
};

export type GiftCardPaymentLink = {
  customerId: string;
  paymentIntentId: string;
  orderId: string;
  url: string;
};

type GiftCardPaymentInput = {
  amount: number;
  firstName: string;
  lastName: string;
  email: string;
  recipient: string;
};

function getApiKey() {
  const apiKey = process.env["STANCER_API_KEY"];
  if (!apiKey) throw new Error("STANCER_API_KEY is not configured");
  if (!/^s(?:test|prod)_/.test(apiKey)) {
    throw new Error("STANCER_API_KEY must be a private server key");
  }
  return apiKey;
}

async function stancerRequest<T>(path: string, init: RequestInit): Promise<T> {
  const authorization = Buffer.from(`${getApiKey()}:`, "utf8").toString("base64");
  const response = await fetch(`${STANCER_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Stancer API request failed (${response.status}) on ${path}`);
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function deleteStancerResource(path: string) {
  try {
    await stancerRequest<unknown>(path, { method: "DELETE" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Stancer cleanup failed on ${path}: ${message}`);
  }
}

export async function createGiftCardPaymentLink(
  input: GiftCardPaymentInput,
): Promise<GiftCardPaymentLink> {
  const customerExternalId = randomUUID();
  const customer = await stancerRequest<StancerCustomer>("/customers/", {
    method: "POST",
    body: JSON.stringify({
      name: `${input.firstName} ${input.lastName}`.trim().slice(0, 64),
      email: input.email,
      external_id: customerExternalId,
    }),
  });

  if (!/^cust_[a-zA-Z0-9]{24}$/.test(customer.id)) {
    throw new Error("Stancer returned an invalid customer identifier");
  }

  const orderId = randomUUID();

  try {
    const description = `Bon cadeau Welcome pour ${input.recipient}`.slice(0, 64);
    const paymentIntent = await stancerRequest<StancerPaymentIntent>("/payment_intents/", {
      method: "POST",
      body: JSON.stringify({
        amount: Math.round(input.amount * 100),
        currency: "eur",
        customer: customer.id,
        description,
        order_id: orderId,
        unique_id: orderId,
        methods_allowed: ["card"],
        threeds: "required",
        capture: true,
      }),
    });

    if (!/^pi_[a-zA-Z0-9]{24}$/.test(paymentIntent.id)) {
      throw new Error("Stancer returned an invalid payment intent identifier");
    }

    const paymentUrl = new URL(paymentIntent.url);
    if (paymentUrl.protocol !== "https:" || paymentUrl.hostname !== "payment.stancer.com") {
      throw new Error("Stancer returned an invalid payment URL");
    }

    return {
      customerId: customer.id,
      paymentIntentId: paymentIntent.id,
      orderId,
      url: paymentUrl.toString(),
    };
  } catch (error) {
    await deleteStancerResource(`/customers/${customer.id}`);
    throw error;
  }
}

export async function cancelGiftCardPaymentLink(payment: GiftCardPaymentLink) {
  await deleteStancerResource(`/payment_intents/${payment.paymentIntentId}`);
  await deleteStancerResource(`/customers/${payment.customerId}`);
}
