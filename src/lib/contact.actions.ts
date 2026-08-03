"use server";

import { z } from "zod";
import { sendContactEmail } from "./contact.server";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(100),
  company: z.string().trim().max(100).optional(),
  email: z.string().trim().email("Adresse e-mail invalide").max(255),
  phone: z.string().trim().max(50).optional(),
  need: z.string().trim().min(1, "Veuillez préciser votre besoin").max(100),
  message: z.string().trim().min(1, "Le message est requis").max(2000),
  rgpd: z.literal(true, {
    errorMap: () => ({ message: "Veuillez accepter la politique de confidentialité" }),
  }),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export type ContactResult =
  | { status: "success" }
  | { status: "invalid"; fieldErrors: Record<string, string> }
  | { status: "error" };

/**
 * Server action du formulaire de contact.
 *
 * Renvoie un résultat typé au lieu de laisser fuiter une exception : les erreurs
 * de validation restent exploitables côté client sans dépendre de la
 * sérialisation d'une erreur Zod. Next.js protège nativement les server actions
 * contre les requêtes cross-site (vérification Origin/Host).
 */
export async function submitContact(input: unknown): Promise<ContactResult> {
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
