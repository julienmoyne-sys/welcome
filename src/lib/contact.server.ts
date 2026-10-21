import nodemailer, { type Transporter } from "nodemailer";

import type { GiftCardPaymentLink } from "./stancer.server";
import type { GiftCardDocumentData } from "./gift-card-pdf.server";

const TO = "contact@welcome-coworking.com";

/**
 * SMTP OVH Email Pro : port 587 en STARTTLS. `secure` ne vaut true que pour le
 * TLS implicite du port 465 — l'inverse fait échouer la poignée de main.
 */
const SMTP_HOST = process.env["SMTP_HOST"] ?? "pro1.mail.ovh.net";
const SMTP_PORT = Number(process.env["SMTP_PORT"] ?? 587);
const SMTP_USER = process.env["SMTP_USER"] ?? TO;
const SMTP_SECURE = SMTP_PORT === 465;

export type ContactPayload = {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  need: string;
  message: string;
};

export type GiftCardPayload = {
  design: "ivory" | "red" | "green" | "birthday" | "thankYou" | "congratulations";
  occasion: "christmas" | "birthday" | "congratulations" | "thankYou";
  amount: number;
  from: string;
  recipient: string;
  message: string;
  organizationType: "company" | "association" | "individual" | "public";
  lastName: string;
  firstName: string;
  billingAddress: string;
  email: string;
};

const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

let transporter: Transporter | null = null;

/**
 * Le transport est mis en cache au niveau du module : `pool: true` garde la
 * connexion TLS ouverte entre deux soumissions au lieu de refaire un handshake
 * et une authentification à chaque envoi.
 */
function getTransporter(): Transporter {
  if (transporter) return transporter;

  const password = process.env["SMTP_PASSWORD"];
  if (!password) throw new Error("SMTP_PASSWORD is not configured");

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    requireTLS: !SMTP_SECURE, // n'envoie rien si le STARTTLS échoue
    auth: { user: SMTP_USER, pass: password },
    tls: { minVersion: "TLSv1.2", servername: SMTP_HOST },
    pool: true,
    maxConnections: 2,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  return transporter;
}

export async function sendContactEmail(data: ContactPayload) {
  const rows: Array<[string, string]> = [
    ["Nom", data.name],
    ["Entreprise", data.company || "—"],
    ["E-mail", data.email],
    ["Téléphone", data.phone || "—"],
    ["Besoin", data.need],
  ];

  const html = `
    <div style="font-family:Arial,sans-serif;color:#0b0b0b">
      <h2 style="color:#0b0b0b">Nouvelle demande de visite</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="color:#5a5a5a">${label}</td><td><strong>${escape(value)}</strong></td></tr>`,
          )
          .join("")}
      </table>
      <p style="color:#5a5a5a;margin-top:16px">Message :</p>
      <p style="white-space:pre-wrap">${escape(data.message)}</p>
    </div>
  `;

  // Version texte : améliore la délivrabilité et évite un mail vide chez les
  // clients qui n'affichent pas le HTML.
  const text = [
    "Nouvelle demande de visite",
    "",
    ...rows.map(([label, value]) => `${label} : ${value}`),
    "",
    "Message :",
    data.message,
  ].join("\n");

  try {
    // L'expéditeur doit rester le compte authentifié : OVH refuse un `from`
    // différent de l'identifiant SMTP. L'adresse du visiteur passe en reply-to.
    const info = await getTransporter().sendMail({
      from: `"Welcome Coworking" <${SMTP_USER}>`,
      to: TO,
      replyTo: `"${data.name.replace(/"/g, "")}" <${data.email}>`,
      subject: `Demande de visite — ${data.name}${data.company ? ` (${data.company})` : ""}`,
      text,
      html,
    });

    if (info.rejected?.length) {
      throw new Error(`SMTP rejected recipients: ${info.rejected.join(", ")}`);
    }

    return { success: true as const };
  } catch (error) {
    // Un transport en cache devenu inutilisable (socket morte, mot de passe
    // changé) serait réutilisé indéfiniment : on le jette pour forcer une
    // reconnexion au prochain envoi.
    transporter?.close();
    transporter = null;

    const message = error instanceof Error ? error.message : String(error);
    console.error(`SMTP send failed via ${SMTP_HOST}:${SMTP_PORT}: ${message}`);
    throw new Error(`Email send failed: ${message}`);
  }
}

const GIFT_CARD_DESIGNS: Record<GiftCardPayload["design"], string> = {
  ivory: "Ivoire & or",
  red: "Rouge de Noël",
  green: "Vert & or",
  birthday: "Anniversaire bordeaux & or",
  thankYou: "Merci végétal",
  congratulations: "Félicitations émeraude & or",
};

const ORGANIZATION_TYPES: Record<GiftCardPayload["organizationType"], string> = {
  company: "Société",
  association: "Association",
  individual: "Personne physique",
  public: "Organisation publique",
};

const GIFT_CARD_OCCASIONS: Record<GiftCardPayload["occasion"], string> = {
  christmas: "Noël",
  birthday: "Anniversaire",
  congratulations: "Félicitations",
  thankYou: "Remerciement",
};

/** Envoie une demande de bon cadeau vers la boîte de contact de Welcome. */
export async function sendGiftCardEmail(data: GiftCardPayload, payment: GiftCardPaymentLink) {
  const formattedAmount = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(data.amount);
  const subjectRecipient = data.recipient.replace(/[\r\n]+/g, " ").trim();
  const replyName = `${data.firstName} ${data.lastName}`.replace(/[\r\n"]/g, " ").trim();
  const occasion = GIFT_CARD_OCCASIONS[data.occasion];

  const rows: Array<[string, string]> = [
    ["Modèle", GIFT_CARD_DESIGNS[data.design]],
    ["Occasion", occasion],
    ["Montant TTC", formattedAmount],
    ["De la part de", data.from],
    ["Pour", data.recipient],
    ["Type d'organisation", ORGANIZATION_TYPES[data.organizationType]],
    ["Nom", data.lastName],
    ["Prénom", data.firstName],
    ["Adresse de facturation", data.billingAddress],
    ["E-mail", data.email],
    ["Référence Stancer", payment.paymentIntentId],
    ["Référence de commande", payment.orderId],
  ];

  const html = `
    <div style="font-family:Arial,sans-serif;color:#0b0b0b">
      <h2 style="color:#0b0b0b">Nouvelle commande de bon cadeau</h2>
      <p style="padding:10px 12px;border-radius:8px;background:#fff3cd;color:#664d03">
        Statut : en attente du paiement Stancer. Vérifier le paiement avant de finaliser le bon et la facture.
      </p>
      <table cellpadding="6" style="border-collapse:collapse">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="color:#5a5a5a">${label}</td><td style="white-space:pre-wrap"><strong>${escape(value)}</strong></td></tr>`,
          )
          .join("")}
      </table>
      <p style="color:#5a5a5a;margin-top:16px">Message :</p>
      <p style="white-space:pre-wrap">${escape(data.message)}</p>
      <p style="margin-top:24px">
        <a href="${escape(payment.url)}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#c6b24a;color:#0b0b0b;font-weight:bold;text-decoration:none">
          Ouvrir le lien de paiement Stancer
        </a>
      </p>
      <p style="color:#5a5a5a;font-size:13px">
        Envoyer ce lien au client uniquement avec l'aperçu personnalisé validé. La facture sera établie manuellement dans LINK après confirmation du paiement.
      </p>
    </div>
  `;

  const text = [
    "Nouvelle commande de bon cadeau",
    "Statut : EN ATTENTE DU PAIEMENT STANCER",
    "Vérifier le paiement avant de finaliser le bon et la facture.",
    "",
    ...rows.map(([label, value]) => `${label} : ${value}`),
    "",
    "Message :",
    data.message,
    "",
    "Lien de paiement Stancer (à envoyer avec l’aperçu personnalisé) :",
    payment.url,
    "",
    "La facture sera établie manuellement dans LINK après confirmation du paiement.",
  ].join("\n");

  try {
    const info = await getTransporter().sendMail({
      from: `"Welcome Coworking" <${SMTP_USER}>`,
      to: TO,
      replyTo: `"${replyName}" <${data.email}>`,
      subject: `[Paiement en attente] Bon cadeau — ${formattedAmount} pour ${subjectRecipient}`,
      text,
      html,
    });

    if (info.rejected?.length) {
      throw new Error(`SMTP rejected recipients: ${info.rejected.join(", ")}`);
    }

    return { success: true as const };
  } catch (error) {
    transporter?.close();
    transporter = null;

    const message = error instanceof Error ? error.message : String(error);
    console.error(`SMTP gift card send failed via ${SMTP_HOST}:${SMTP_PORT}: ${message}`);
    throw new Error(`Email send failed: ${message}`);
  }
}

const DELIVERY_COPY = {
  fr: {
    subject: "Votre bon cadeau Welcome! Coworking",
    title: "Votre bon cadeau est prêt",
    intro:
      "Votre paiement a bien été confirmé. Vous trouverez votre bon cadeau personnalisé en pièce jointe au format PDF.",
    invoice: "Votre facture électronique vous sera envoyée séparément.",
  },
  en: {
    subject: "Your Welcome! Coworking gift voucher",
    title: "Your gift voucher is ready",
    intro: "Your payment has been confirmed. Your personalised gift voucher is attached as a PDF.",
    invoice: "Your electronic invoice will be sent separately.",
  },
  de: {
    subject: "Ihr Welcome! Coworking-Geschenkgutschein",
    title: "Ihr Geschenkgutschein ist fertig",
    intro:
      "Ihre Zahlung wurde bestätigt. Ihren personalisierten Geschenkgutschein finden Sie als PDF im Anhang.",
    invoice: "Ihre elektronische Rechnung wird Ihnen separat zugesandt.",
  },
} as const;

export async function sendGiftCardDeliveryEmail(
  data: GiftCardDocumentData & { email: string },
  paymentIntentId: string,
  pdf: Buffer,
) {
  const copy = DELIVERY_COPY[data.locale];
  const amount = new Intl.NumberFormat(data.locale, {
    style: "currency",
    currency: "EUR",
  }).format(data.amount);
  const html = `
    <div style="font-family:Arial,sans-serif;color:#0b0b0b;line-height:1.6">
      <h2>${escape(copy.title)}</h2>
      <p>${escape(copy.intro)}</p>
      <p><strong>${escape(amount)}</strong> — ${escape(data.recipient)}</p>
      <p>${escape(copy.invoice)}</p>
      <p style="color:#5a5a5a;font-size:13px">Welcome! Coworking · contact@welcome-coworking.com</p>
    </div>
  `;
  const text = [copy.title, "", copy.intro, `${amount} — ${data.recipient}`, "", copy.invoice].join(
    "\n",
  );

  try {
    const info = await getTransporter().sendMail({
      from: `"Welcome Coworking" <${SMTP_USER}>`,
      to: data.email,
      replyTo: TO,
      messageId: `<gift-card-${paymentIntentId}@welcome-coworking.com>`,
      subject: copy.subject,
      text,
      html,
      attachments: [
        {
          filename: "bon-cadeau-welcome-coworking.pdf",
          content: pdf,
          contentType: "application/pdf",
        },
      ],
    });

    if (info.rejected?.length) {
      throw new Error(`SMTP rejected recipients: ${info.rejected.join(", ")}`);
    }
  } catch (error) {
    transporter?.close();
    transporter = null;
    const message = error instanceof Error ? error.message : String(error);
    console.error(`SMTP gift card delivery failed via ${SMTP_HOST}:${SMTP_PORT}: ${message}`);
    throw new Error(`Gift card delivery failed: ${message}`);
  }
}
