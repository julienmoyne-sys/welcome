"use server";

import { getTranslations } from "next-intl/server";
import { z } from "zod";

import { sendGiftCardEmail } from "./contact.server";

export type GiftCardResult =
  | { status: "success" }
  | { status: "invalid"; fieldErrors: Record<string, string> }
  | { status: "error" };

export async function submitGiftCard(input: unknown, locale: string): Promise<GiftCardResult> {
  const t = await getTranslations({ locale, namespace: "shop.validation" });

  const schema = z.object({
    design: z.enum(["ivory", "red", "green"]),
    amount: z.coerce.number().positive(t("amountRequired")).max(10_000, t("amountMaximum")),
    from: z.string().trim().min(1, t("fromRequired")).max(100),
    recipient: z.string().trim().min(1, t("recipientRequired")).max(100),
    message: z.string().trim().min(1, t("messageRequired")).max(1_000),
  });

  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { status: "invalid", fieldErrors };
  }

  try {
    await sendGiftCardEmail(parsed.data);
    return { status: "success" };
  } catch (error) {
    console.error(error);
    return { status: "error" };
  }
}
