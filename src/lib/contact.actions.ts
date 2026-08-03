"use server";

import { getTranslations } from "next-intl/server";
import { z } from "zod";

import { sendContactEmail } from "./contact.server";

export type ContactResult =
  | { status: "success" }
  | { status: "invalid"; fieldErrors: Record<string, string> }
  | { status: "error" };

/**
 * Server action du formulaire de contact.
 *
 * La langue est passée explicitement par l'appelant : une server action ne reçoit
 * pas l'URL, `getTranslations()` ne peut donc pas la déduire du segment `[locale]`.
 *
 * Renvoie un résultat typé au lieu de laisser fuiter une exception : les erreurs de
 * validation restent exploitables côté client sans dépendre de la sérialisation
 * d'une erreur Zod. Next.js protège nativement les server actions contre les
 * requêtes cross-site (vérification Origin/Host).
 */
export async function submitContact(input: unknown, locale: string): Promise<ContactResult> {
  const t = await getTranslations({ locale, namespace: "contact.validation" });

  const contactSchema = z.object({
    name: z.string().trim().min(1, t("nameRequired")).max(100),
    company: z.string().trim().max(100).optional(),
    email: z.string().trim().email(t("emailInvalid")).max(255),
    phone: z.string().trim().max(50).optional(),
    need: z.string().trim().min(1, t("needRequired")).max(100),
    message: z.string().trim().min(1, t("messageRequired")).max(2000),
    rgpd: z.literal(true, { errorMap: () => ({ message: t("rgpdRequired") }) }),
  });

  const parsed = contactSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return { status: "invalid", fieldErrors };
  }

  const { rgpd: _rgpd, ...payload } = parsed.data;

  try {
    await sendContactEmail(payload);
    return { status: "success" };
  } catch (error) {
    // Le détail reste dans les logs serveur : pas de fuite vers le client.
    console.error(error);
    return { status: "error" };
  }
}
