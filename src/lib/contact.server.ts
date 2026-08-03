const RESEND_URL = "https://api.resend.com/emails";

const TO = "contact@welcome-coworking.com";
const FROM = "Welcome Coworking <contact@welcome-coworking.com>";

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

export async function sendContactEmail(data: ContactPayload) {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");

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

  const response = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      reply_to: data.email,
      subject: `Demande de visite — ${data.name}${data.company ? ` (${data.company})` : ""}`,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`Resend request failed [${response.status}]: ${body}`);
    throw new Error(`Email send failed [${response.status}]: ${body}`);
  }

  return { success: true as const };
}
