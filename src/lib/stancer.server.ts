import "server-only";

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

const STANCER_API_URL = "https://api.stancer.com/v2";

type StancerCustomer = {
  id: string;
};

type StancerPaymentIntent = {
  id: string;
  url: string;
  amount: number;
  currency: string;
  status: string;
  metadata?: GiftCardPaymentMetadata;
};

export type GiftCardPaymentMetadata = {
  application: "welcome_gift_card";
  version: 1;
  giftCard: {
    design:
      | "ivory"
      | "red"
      | "green"
      | "birthday"
      | "thankYou"
      | "congratulations"
      | "cloudBirthday"
      | "cloudThankYou"
      | "cloudCongratulations";
    occasion?: "christmas" | "birthday" | "congratulations" | "thankYou";
    from: string;
    recipient: string;
    message: string;
    email: string;
    locale: "fr" | "en" | "de";
  };
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
  design:
    | "ivory"
    | "red"
    | "green"
    | "birthday"
    | "thankYou"
    | "congratulations"
    | "cloudBirthday"
    | "cloudThankYou"
    | "cloudCongratulations";
  occasion: "christmas" | "birthday" | "congratulations" | "thankYou";
  from: string;
  message: string;
  locale: "fr" | "en" | "de";
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
  const metadata: GiftCardPaymentMetadata = {
    application: "welcome_gift_card",
    version: 1,
    giftCard: {
      design: input.design,
      occasion: input.occasion,
      from: input.from,
      recipient: input.recipient,
      message: input.message,
      email: input.email,
      locale: input.locale,
    },
  };

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
        return_url: `https://www.welcome-coworking.com/${input.locale}/shop/confirmation`,
        metadata,
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

export async function getStancerPaymentIntent(paymentIntentId: string) {
  if (!/^pi_[a-zA-Z0-9]{24}$/.test(paymentIntentId)) {
    throw new Error("Invalid Stancer payment intent identifier");
  }
  return stancerRequest<StancerPaymentIntent>(`/payment_intents/${paymentIntentId}`, {
    method: "GET",
  });
}

export function verifyStancerSignature(payload: string, signatureHeader: string | null) {
  const secret = process.env["STANCER_WEBHOOK_SECRET"];
  if (!secret) throw new Error("STANCER_WEBHOOK_SECRET is not configured");
  if (!/^[a-fA-F0-9]+$/.test(secret) || secret.length % 2 !== 0) {
    throw new Error("STANCER_WEBHOOK_SECRET is invalid");
  }
  if (!signatureHeader) return false;

  const parts = new Map(
    signatureHeader.split(",").flatMap((part) => {
      const separator = part.indexOf("=");
      return separator > 0 ? [[part.slice(0, separator), part.slice(separator + 1)]] : [];
    }),
  );
  const timestamp = Number(parts.get("t"));
  const expected = parts.get("v1");
  if (!Number.isInteger(timestamp) || !expected || !/^[a-fA-F0-9]{64}$/.test(expected))
    return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > 60) return false;

  const computed = createHmac("sha256", Buffer.from(secret, "hex"))
    .update(`${timestamp}.${payload}`)
    .digest();
  const supplied = Buffer.from(expected, "hex");
  return supplied.length === computed.length && timingSafeEqual(supplied, computed);
}

export async function cancelGiftCardPaymentLink(payment: GiftCardPaymentLink) {
  await deleteStancerResource(`/payment_intents/${payment.paymentIntentId}`);
  await deleteStancerResource(`/customers/${payment.customerId}`);
}
