import nodemailer, { type Transporter } from "nodemailer";

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
