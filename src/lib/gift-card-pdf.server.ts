import sharp from "sharp";

export type GiftCardDocumentData = {
  design: "ivory" | "red" | "green";
  amount: number;
  from: string;
  recipient: string;
  message: string;
  locale: "fr" | "en" | "de";
};

const THEMES: Record<
  GiftCardDocumentData["design"],
  { background: string; foreground: string; accent: string }
> = {
  ivory: { background: "#f8f3e9", foreground: "#171512", accent: "#bd8528" },
  red: { background: "#7f1118", foreground: "#fff9eb", accent: "#e2bd62" },
  green: { background: "#063a2a", foreground: "#fffdf4", accent: "#d8b65a" },
};

const COPY = {
  fr: {
    title: "CHÈQUE CADEAU",
    subtitle: "NOËL 2026",
    personalized: "Bon cadeau personnalisé",
    recipient: "Pour",
    from: "De la part de",
    message: "Votre message",
    validity: "Valable du 01/01/2027 au 31/12/2028",
    services: "Open space  •  Bureau privatif  •  Salle de réunion",
  },
  en: {
    title: "GIFT VOUCHER",
    subtitle: "CHRISTMAS 2026",
    personalized: "Personalised gift voucher",
    recipient: "For",
    from: "From",
    message: "Your message",
    validity: "Valid from 01/01/2027 to 31/12/2028",
    services: "Open space  •  Private office  •  Meeting room",
  },
  de: {
    title: "GESCHENKGUTSCHEIN",
    subtitle: "WEIHNACHTEN 2026",
    personalized: "Personalisierter Geschenkgutschein",
    recipient: "Für",
    from: "Von",
    message: "Ihre Nachricht",
    validity: "Gültig vom 01.01.2027 bis zum 31.12.2028",
    services: "Open Space  •  Privatbüro  •  Besprechungsraum",
  },
} as const;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(value: string, maxCharacters: number, maxLines: number) {
  const words = value.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharacters) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = word;
    if (lines.length === maxLines - 1) break;
  }

  if (current && lines.length < maxLines) lines.push(current);
  if (words.join(" ").length > lines.join(" ").length && lines.length) {
    lines[lines.length - 1] = `${lines
      .at(-1)
      ?.slice(0, maxCharacters - 1)
      .trimEnd()}…`;
  }
  return lines;
}

function linesToSvg(lines: string[], x: number, startY: number, lineHeight: number) {
  return lines
    .map(
      (line, index) =>
        `<tspan x="${x}" y="${startY + index * lineHeight}">${escapeXml(line)}</tspan>`,
    )
    .join("");
}

function jpegToPdf(jpeg: Buffer, width: number, height: number) {
  const parts: Buffer[] = [];
  const offsets = [0];
  let offset = 0;

  const append = (value: string | Buffer) => {
    const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value, "binary");
    parts.push(buffer);
    offset += buffer.length;
  };
  const object = (id: number, body: string | Buffer) => {
    offsets[id] = offset;
    append(`${id} 0 obj\n`);
    append(body);
    append("\nendobj\n");
  };

  append("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  object(1, "<< /Type /Catalog /Pages 2 0 R >>");
  object(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  object(
    3,
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /XObject << /GiftCard 5 0 R >> >> /Contents 4 0 R >>",
  );
  const content = "q\n842 0 0 595 0 0 cm\n/GiftCard Do\nQ";
  object(4, `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`);

  offsets[5] = offset;
  append("5 0 obj\n");
  append(
    `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
  );
  append(jpeg);
  append("\nendstream\nendobj\n");

  const xrefOffset = offset;
  append("xref\n0 6\n0000000000 65535 f \n");
  for (let index = 1; index <= 5; index += 1) {
    append(`${String(offsets[index]).padStart(10, "0")} 00000 n \n`);
  }
  append(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

  return Buffer.concat(parts);
}

export async function generateGiftCardPdf(data: GiftCardDocumentData) {
  const theme = THEMES[data.design];
  const copy = COPY[data.locale];
  const amount = new Intl.NumberFormat(data.locale, {
    style: "currency",
    currency: "EUR",
  }).format(data.amount);
  const messageLines = wrapText(data.message, 58, 3);
  const recipient = escapeXml(data.recipient.slice(0, 100));
  const from = escapeXml(data.from.slice(0, 100));

  const svg = `
    <svg width="1600" height="1131" viewBox="0 0 1600 1131" xmlns="http://www.w3.org/2000/svg">
      <rect width="1600" height="1131" fill="${theme.background}"/>
      <rect x="34" y="34" width="1532" height="1063" rx="20" fill="none" stroke="${theme.accent}" stroke-width="4"/>
      <circle cx="1390" cy="170" r="210" fill="${theme.accent}" opacity="0.10"/>
      <circle cx="150" cy="980" r="250" fill="${theme.accent}" opacity="0.08"/>
      <g fill="${theme.accent}" opacity="0.75" font-family="Arial, sans-serif" font-size="44">
        <text x="85" y="120">✦</text><text x="1450" y="130">❄</text><text x="1370" y="1040">✦</text>
      </g>

      <text x="100" y="150" fill="${theme.foreground}" font-family="Arial, sans-serif" font-size="62" font-weight="800" letter-spacing="3">WELCOME<tspan fill="${theme.accent}">!</tspan></text>
      <text x="103" y="195" fill="${theme.foreground}" opacity="0.82" font-family="Arial, sans-serif" font-size="25" letter-spacing="10">COWORKING</text>

      <text x="800" y="325" text-anchor="middle" fill="${theme.foreground}" font-family="Georgia, serif" font-size="82" font-weight="700" letter-spacing="3">${copy.title}</text>
      <text x="800" y="390" text-anchor="middle" fill="${theme.accent}" font-family="Arial, sans-serif" font-size="35" font-weight="700" letter-spacing="12">${copy.subtitle}</text>

      <rect x="450" y="455" width="700" height="185" rx="24" fill="${theme.accent}"/>
      <text x="800" y="535" text-anchor="middle" fill="${theme.background}" font-family="Arial, sans-serif" font-size="27" font-weight="700" letter-spacing="2">${copy.personalized}</text>
      <text x="800" y="610" text-anchor="middle" fill="${theme.background}" font-family="Arial, sans-serif" font-size="70" font-weight="800">${escapeXml(amount)}</text>

      <g font-family="Arial, sans-serif" fill="${theme.foreground}">
        <text x="150" y="735" font-size="25" font-weight="700" fill="${theme.accent}">${copy.recipient.toUpperCase()}</text>
        <text x="150" y="785" font-size="36" font-weight="700">${recipient}</text>
        <text x="850" y="735" font-size="25" font-weight="700" fill="${theme.accent}">${copy.from.toUpperCase()}</text>
        <text x="850" y="785" font-size="36" font-weight="700">${from}</text>
        <text x="150" y="865" font-size="25" font-weight="700" fill="${theme.accent}">${copy.message.toUpperCase()}</text>
        <text x="150" y="910" font-size="29" font-style="italic">${linesToSvg(messageLines, 150, 910, 38)}</text>
      </g>

      <line x1="150" y1="1010" x2="1450" y2="1010" stroke="${theme.accent}" stroke-width="2" opacity="0.7"/>
      <text x="150" y="1055" fill="${theme.foreground}" opacity="0.80" font-family="Arial, sans-serif" font-size="23">${copy.services}</text>
      <text x="1450" y="1055" text-anchor="end" fill="${theme.foreground}" opacity="0.80" font-family="Arial, sans-serif" font-size="23">${copy.validity}</text>
    </svg>
  `;

  const jpeg = await sharp(Buffer.from(svg))
    .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
    .toBuffer();
  return jpegToPdf(jpeg, 1600, 1131);
}
