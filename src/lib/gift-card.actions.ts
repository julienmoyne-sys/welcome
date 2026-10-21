"use server";

import { getTranslations } from "next-intl/server";
import { z } from "zod";

import { sendGiftCardEmail } from "./contact.server";
import { cancelGiftCardPaymentLink, createGiftCardPaymentLink } from "./stancer.server";

export type GiftCardResult =
  | { status: "success"; paymentUrl: string }
  | { status: "invalid"; fieldErrors: Record<string, string> }
  | { status: "error" };

export type GiftCardValidationResult =
  { status: "valid" } | { status: "invalid"; fieldErrors: Record<string, string> };

async function parseGiftCard(input: unknown, locale: string) {
  const t = await getTranslations({ locale, namespace: "shop.validation" });

  const schema = z
    .object({
      design: z.enum(["ivory", "red", "green"]),
      amount: z.coerce
        .number()
        .positive(t("amountRequired"))
        .max(10_000, t("amountMaximum"))
        .refine((value) => Number.isInteger(value * 100), t("amountPrecision")),
      from: z.string().trim().min(1, t("fromRequired")).max(100),
      recipient: z.string().trim().min(1, t("recipientRequired")).max(100),
      message: z.string().trim().min(1, t("messageRequired")).max(1_000),
      organizationType: z.enum(["company", "association", "individual", "public"], {
        errorMap: () => ({ message: t("organizationTypeRequired") }),
      }),
      lastName: z.string().trim().min(1, t("lastNameRequired")).max(100),
      firstName: z.string().trim().min(1, t("firstNameRequired")).max(100),
      billingAddress: z.string().trim().min(1, t("billingAddressRequired")).max(500),
      email: z.string().trim().min(1, t("emailRequired")).email(t("emailInvalid")).max(255),
      emailConfirmation: z
        .string()
        .trim()
        .min(1, t("emailConfirmationRequired"))
        .email(t("emailInvalid"))
        .max(255),
    })
    .superRefine((data, context) => {
      if (data.email.toLocaleLowerCase() !== data.emailConfirmation.toLocaleLowerCase()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["emailConfirmation"],
          message: t("emailMismatch"),
        });
      }
    });

  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { success: false as const, fieldErrors };
  }

  const { emailConfirmation: _emailConfirmation, ...payload } = parsed.data;
  return { success: true as const, payload };
}

export async function validateGiftCard(
  input: unknown,
  locale: string,
): Promise<GiftCardValidationResult> {
  const parsed = await parseGiftCard(input, locale);
  if (!parsed.success) return { status: "invalid", fieldErrors: parsed.fieldErrors };
  return { status: "valid" };
}

export async function submitGiftCard(input: unknown, locale: string): Promise<GiftCardResult> {
  const parsed = await parseGiftCard(input, locale);
  if (!parsed.success) return { status: "invalid", fieldErrors: parsed.fieldErrors };
  const orderLocale = locale === "en" || locale === "de" ? locale : "fr";

  try {
    const payment = await createGiftCardPaymentLink({ ...parsed.payload, locale: orderLocale });

    try {
      await sendGiftCardEmail(parsed.payload, payment);
    } catch (error) {
      await cancelGiftCardPaymentLink(payment);
      throw error;
    }

    return { status: "success", paymentUrl: payment.url };
  } catch (error) {
    console.error(error);
    return { status: "error" };
  }
}
