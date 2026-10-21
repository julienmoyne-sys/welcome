import { readFile } from "node:fs/promises";
import { join } from "node:path";

import sharp from "sharp";

export type GiftCardOccasion =
  "christmas" | "birthday" | "congratulations" | "thankYou" | "retirement" | "other";

export type GiftCardDocumentData = {
  design: "ivory" | "red" | "green";
  occasion: GiftCardOccasion;
  customOccasion?: string;
  amount: number;
  from: string;
  recipient: string;
  message: string;
  locale: "fr" | "en" | "de";
};

const TEMPLATE_FILENAMES: Record<GiftCardDocumentData["design"], string> = {
  ivory: "gift-card-template-ivory.png",
  red: "gift-card-template-red.png",
  green: "gift-card-template-green.png",
};

const COPY = {
  fr: {
    recipient: "Pour",
    from: "De la part de",
    message: "Message",
    validity: (start: string, end: string) => `Valable du ${start} au ${end}`,
    occasions: {
      christmas: "NOËL",
      birthday: "ANNIVERSAIRE",
      congratulations: "FÉLICITATIONS",
      thankYou: "MERCI",
      retirement: "RETRAITE",
    },
  },
  en: {
    recipient: "For",
    from: "From",
    message: "Message",
    validity: (start: string, end: string) => `Valid from ${start} to ${end}`,
    occasions: {
      christmas: "CHRISTMAS",
      birthday: "BIRTHDAY",
      congratulations: "CONGRATULATIONS",
      thankYou: "THANK YOU",
      retirement: "RETIREMENT",
    },
  },
  de: {
    recipient: "Für",
    from: "Von",
    message: "Nachricht",
    validity: (start: string, end: string) => `Gültig vom ${start} bis ${end}`,
    occasions: {
      christmas: "WEIHNACHTEN",
      birthday: "GEBURTSTAG",
      congratulations: "HERZLICHEN GLÜCKWUNSCH",
      thankYou: "DANKE",
      retirement: "RUHESTAND",
    },
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

function textSpans(lines: string[], x: number, startY: number, lineHeight: number) {
  return lines
    .map(
      (line, index) =>
        `<tspan x="${x}" y="${startY + index * lineHeight}">${escapeXml(line)}</tspan>`,
    )
    .join("");
}

function fontSizeFor(value: string, normal: number, compact: number, threshold: number) {
  return value.length > threshold ? compact : normal;
}

function getParisCivilDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

function formatCivilDate(
  value: { year: number; month: number; day: number },
  locale: GiftCardDocumentData["locale"],
) {
  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(Date.UTC(value.year, value.month - 1, value.day, 12)));
}

function addTwoYears(value: { year: number; month: number; day: number }) {
  const targetYear = value.year + 2;
  const lastDay = new Date(Date.UTC(targetYear, value.month, 0)).getUTCDate();
  return { ...value, year: targetYear, day: Math.min(value.day, lastDay) };
}

function occasionLabel(data: GiftCardDocumentData, year: number) {
  const copy = COPY[data.locale];
  if (data.occasion === "other") {
    return (data.customOccasion ?? "").trim().toLocaleUpperCase(data.locale);
  }
  const label = copy.occasions[data.occasion];
  return data.occasion === "christmas" ? `${label} ${year}` : label;
}

function buildOverlay(data: GiftCardDocumentData) {
  const copy = COPY[data.locale];
  const issueDate = getParisCivilDate(new Date());
  const expirationDate = addTwoYears(issueDate);
  const occasion = escapeXml(occasionLabel(data, issueDate.year).slice(0, 50));
  const amount = escapeXml(
    new Intl.NumberFormat(data.locale, { style: "currency", currency: "EUR" }).format(data.amount),
  );
  const validity = escapeXml(
    copy.validity(
      formatCivilDate(issueDate, data.locale),
      formatCivilDate(expirationDate, data.locale),
    ),
  );
  const recipient = escapeXml(data.recipient.slice(0, 100));
  const from = escapeXml(data.from.slice(0, 100));

  if (data.design === "red") {
    const message = wrapText(data.message, 34, 3);
    return `
      <svg width="1536" height="1024" viewBox="0 0 1536 1024" xmlns="http://www.w3.org/2000/svg">
        <g font-family="Georgia, serif">
          <text x="650" y="573" text-anchor="middle" fill="#9b1119" font-size="${fontSizeFor(occasion, 45, 34, 22)}" font-weight="700" letter-spacing="3">${occasion}</text>
          <text x="645" y="710" text-anchor="middle" fill="#fff8e9" font-size="${fontSizeFor(amount, 100, 78, 10)}" font-weight="700">${amount}</text>
        </g>
        <g fill="#94131a" font-family="Georgia, serif" font-size="24">
          <text x="1100" y="558"><tspan font-weight="700">${copy.recipient} :</tspan> ${recipient}</text>
          <text x="1100" y="613"><tspan font-weight="700">${copy.from} :</tspan> ${from}</text>
          <text x="1100" y="668" font-weight="700">${copy.message} :</text>
          <text x="1100" y="711" font-size="22" font-style="italic">${textSpans(message, 1100, 711, 37)}</text>
        </g>
        <text x="640" y="798" text-anchor="middle" fill="#2b1b14" font-family="Georgia, serif" font-size="21">${validity}</text>
      </svg>`;
  }

  if (data.design === "green") {
    const message = wrapText(data.message, 52, 2);
    return `
      <svg width="1536" height="1024" viewBox="0 0 1536 1024" xmlns="http://www.w3.org/2000/svg">
        <g font-family="Georgia, serif">
          <text x="430" y="307" text-anchor="middle" fill="#fff9e8" font-size="${fontSizeFor(occasion, 46, 34, 22)}" font-weight="700" letter-spacing="2">${occasion}</text>
          <text x="420" y="475" text-anchor="middle" fill="#063a2a" font-size="${fontSizeFor(amount, 112, 86, 10)}" font-weight="700">${amount}</text>
          <text x="430" y="576" text-anchor="middle" fill="#fff9e8" font-size="22">${validity}</text>
        </g>
        <g fill="#171512" font-family="Georgia, serif" font-size="23">
          <text x="125" y="817"><tspan font-weight="700">${copy.recipient} :</tspan> ${recipient}</text>
          <text x="125" y="862"><tspan font-weight="700">${copy.from} :</tspan> ${from}</text>
          <text x="125" y="907" font-weight="700">${copy.message} :</text>
          <text x="310" y="907" font-size="21" font-style="italic">${textSpans(message, 310, 907, 31)}</text>
        </g>
      </svg>`;
  }

  const message = wrapText(data.message, 38, 2);
  return `
    <svg width="1536" height="1024" viewBox="0 0 1536 1024" xmlns="http://www.w3.org/2000/svg">
      <g font-family="Arial, sans-serif">
        <text x="410" y="337" text-anchor="middle" fill="#bd8528" font-size="${fontSizeFor(occasion, 42, 32, 22)}" font-weight="600" letter-spacing="7">${occasion}</text>
        <text x="400" y="520" text-anchor="middle" fill="#bd8528" font-size="${fontSizeFor(amount, 124, 92, 10)}" font-weight="800">${amount}</text>
        <text x="400" y="570" text-anchor="middle" fill="#171512" font-size="22">${validity}</text>
        <g fill="#171512" font-size="25">
          <text x="105" y="790"><tspan font-weight="700">${copy.recipient} :</tspan> ${recipient}</text>
          <text x="105" y="837"><tspan font-weight="700">${copy.from} :</tspan> ${from}</text>
          <text x="105" y="884" font-weight="700">${copy.message} :</text>
          <text x="295" y="884" font-size="22" font-style="italic">${textSpans(message, 295, 884, 32)}</text>
        </g>
      </g>
    </svg>`;
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
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 561.333] /Resources << /XObject << /GiftCard 5 0 R >> >> /Contents 4 0 R >>",
  );
  const content = "q\n842 0 0 561.333 0 0 cm\n/GiftCard Do\nQ";
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
  const template = await readFile(
    join(process.cwd(), "src", "assets", TEMPLATE_FILENAMES[data.design]),
  );
  const jpeg = await sharp(template)
    .composite([{ input: Buffer.from(buildOverlay(data)), top: 0, left: 0 }])
    .jpeg({ quality: 94, chromaSubsampling: "4:4:4" })
    .toBuffer();
  return jpegToPdf(jpeg, 1536, 1024);
}
