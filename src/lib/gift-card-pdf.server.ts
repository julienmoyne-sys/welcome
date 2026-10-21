import { readFile } from "node:fs/promises";
import { join } from "node:path";

import sharp, { type OverlayOptions } from "sharp";

export type GiftCardOccasion = "christmas" | "birthday" | "congratulations" | "thankYou";

export type GiftCardDocumentData = {
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
  occasion: GiftCardOccasion;
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
  birthday: "gift-card-template-birthday.png",
  thankYou: "gift-card-template-thank-you.png",
  congratulations: "gift-card-template-congratulations.png",
  cloudBirthday: "gift-card-private-office-clouds.png",
  cloudThankYou: "gift-card-private-office-clouds.png",
  cloudCongratulations: "gift-card-private-office-clouds.png",
};

const TEXT_FONT_FILE = join(
  process.cwd(),
  "node_modules",
  "next",
  "dist",
  "compiled",
  "@vercel",
  "og",
  "Geist-Regular.ttf",
);

type CloudDesign = "cloudBirthday" | "cloudThankYou" | "cloudCongratulations";

function isCloudDesign(design: GiftCardDocumentData["design"]): design is CloudDesign {
  return (
    design === "cloudBirthday" || design === "cloudThankYou" || design === "cloudCongratulations"
  );
}

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

type TextLayerOptions = {
  text: string;
  left?: number;
  centerX?: number;
  baseline: number;
  width: number;
  size: number;
  color: string;
  align?: "left" | "centre" | "right";
  bold?: boolean;
  italic?: boolean;
  letterSpacing?: number;
};

async function textLayer({
  text,
  left,
  centerX,
  baseline,
  width,
  size,
  color,
  align = "left",
  bold = false,
  italic = false,
  letterSpacing = 0,
}: TextLayerOptions): Promise<OverlayOptions> {
  const attributes = [
    `foreground="${color}"`,
    bold ? 'weight="bold"' : "",
    italic ? 'style="italic"' : "",
    letterSpacing ? `letter_spacing="${letterSpacing * 1024}"` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const input = await sharp({
    text: {
      text: `<span ${attributes}>${text}</span>`,
      font: `Geist ${size}`,
      fontfile: TEXT_FONT_FILE,
      width,
      align,
      rgba: true,
      dpi: 72,
    },
  })
    .png()
    .toBuffer();
  const metadata = await sharp(input).metadata();
  const measuredWidth = metadata.width ?? width;

  return {
    input,
    left: centerX === undefined ? (left ?? 0) : Math.round(centerX - measuredWidth / 2),
    top: Math.max(0, Math.round(baseline - size * 1.05)),
  };
}

function linesMarkup(lines: string[]) {
  return lines.map(escapeXml).join("\n");
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
  const label = copy.occasions[data.occasion];
  return data.occasion === "christmas" ? `${label} ${year}` : label;
}

function buildCloudOverlay(
  data: GiftCardDocumentData & { design: CloudDesign },
  values: {
    occasion: string;
    amount: string;
    validity: string;
    recipient: string;
    from: string;
  },
) {
  const copy = COPY[data.locale];
  const palettes = {
    cloudBirthday: {
      panel: "#781c2e",
      text: "#fff9ec",
      accent: "#f0cf7a",
      amountBackground: "#fff9ec",
      amountText: "#781c2e",
    },
    cloudThankYou: {
      panel: "#f5efe4",
      text: "#173f32",
      accent: "#b67b29",
      amountBackground: "#173f32",
      amountText: "#fff9ec",
    },
    cloudCongratulations: {
      panel: "#063a2a",
      text: "#fff9ec",
      accent: "#e3c366",
      amountBackground: "#e3c366",
      amountText: "#063a2a",
    },
  } as const;
  const palette = palettes[data.design];
  const message = wrapText(data.message, 46, 4);

  return `
    <svg width="1536" height="1024" viewBox="0 0 1536 1024" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="960" height="1024" fill="${palette.panel}"/>
      <rect x="36" y="36" width="888" height="952" rx="22" fill="none" stroke="${palette.accent}" stroke-width="3" opacity="0.75"/>
      <line x1="959" y1="0" x2="959" y2="1024" stroke="${palette.accent}" stroke-width="4"/>
      <g font-family="Arial, sans-serif">
        <rect x="90" y="62" width="380" height="105" rx="12" fill="#fffdf7"/>
        <text x="480" y="211" text-anchor="middle" fill="${palette.text}" font-family="Georgia, serif" font-size="34" font-weight="700" letter-spacing="5">CHÈQUE CADEAU</text>
        <text x="480" y="278" text-anchor="middle" fill="${palette.accent}" font-family="Georgia, serif" font-size="${fontSizeFor(values.occasion, 45, 35, 22)}" font-weight="700" letter-spacing="3">${values.occasion}</text>
        <rect x="90" y="315" width="780" height="180" rx="20" fill="${palette.amountBackground}" stroke="${palette.accent}" stroke-width="4"/>
        <text x="480" y="435" text-anchor="middle" fill="${palette.amountText}" font-size="${fontSizeFor(values.amount, 108, 88, 10)}" font-weight="800">${values.amount}</text>
        <text x="480" y="548" text-anchor="middle" fill="${palette.text}" font-size="23" opacity="0.9">${values.validity}</text>
        <line x1="90" y1="590" x2="870" y2="590" stroke="${palette.accent}" stroke-width="2" opacity="0.6"/>
        <g fill="${palette.text}" font-size="27">
          <text x="100" y="657"><tspan font-weight="700">${copy.recipient} :</tspan> ${values.recipient}</text>
          <text x="100" y="718"><tspan font-weight="700">${copy.from} :</tspan> ${values.from}</text>
          <text x="100" y="779" font-weight="700">${copy.message} :</text>
          <text x="100" y="812" font-size="24" font-style="italic">${textSpans(message, 100, 812, 34)}</text>
        </g>
        <text x="100" y="957" fill="${palette.accent}" font-size="20" letter-spacing="2">welcome-coworking.com</text>
      </g>
    </svg>`;
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

  if (isCloudDesign(data.design)) {
    return buildCloudOverlay(
      { ...data, design: data.design },
      { occasion, amount, validity, recipient, from },
    );
  }

  if (data.design === "red" || data.design === "birthday") {
    const recipientLines = wrapText(data.recipient, 34, 2);
    const fromLines = wrapText(data.from, 34, 2);
    const message = wrapText(data.message, 32, 5);
    return `
      <svg width="1536" height="1024" viewBox="0 0 1536 1024" xmlns="http://www.w3.org/2000/svg">
        <g font-family="Georgia, serif">
          <text x="650" y="573" text-anchor="middle" fill="#9b1119" font-size="${fontSizeFor(occasion, 42, 32, 20)}" font-weight="700" letter-spacing="2">${occasion}</text>
          <text x="645" y="704" text-anchor="middle" fill="#fff8e9" font-size="${fontSizeFor(amount, 92, 72, 9)}" font-weight="700">${amount}</text>
        </g>
        <g fill="#94131a" font-family="Georgia, serif">
          <text x="1100" y="554" font-size="22" font-weight="700">${copy.recipient} :</text>
          <text x="1100" y="584" font-size="20">${textSpans(recipientLines, 1100, 584, 25)}</text>
          <text x="1100" y="646" font-size="22" font-weight="700">${copy.from} :</text>
          <text x="1100" y="676" font-size="20">${textSpans(fromLines, 1100, 676, 25)}</text>
          <text x="1100" y="733" font-size="21" font-weight="700">${copy.message} :</text>
          <text x="1100" y="757" font-size="17" font-style="italic">${textSpans(message, 1100, 757, 19)}</text>
        </g>
        <text x="640" y="798" text-anchor="middle" fill="#2b1b14" font-family="Georgia, serif" font-size="21">${validity}</text>
      </svg>`;
  }

  if (data.design === "green" || data.design === "congratulations") {
    const message = wrapText(data.message, 48, 4);
    return `
      <svg width="1536" height="1024" viewBox="0 0 1536 1024" xmlns="http://www.w3.org/2000/svg">
        <rect x="100" y="260" width="660" height="70" rx="8" fill="#063a2a"/>
        <g font-family="Georgia, serif">
          <text x="430" y="307" text-anchor="middle" fill="#fff9e8" font-size="${fontSizeFor(occasion, 42, 32, 20)}" font-weight="700" letter-spacing="2">${occasion}</text>
          <text x="420" y="470" text-anchor="middle" fill="#063a2a" font-size="${fontSizeFor(amount, 102, 78, 9)}" font-weight="700">${amount}</text>
          <text x="430" y="576" text-anchor="middle" fill="#fff9e8" font-size="22">${validity}</text>
        </g>
        <g fill="#171512" font-family="Georgia, serif" font-size="20">
          <text x="125" y="804"><tspan font-weight="700">${copy.recipient} :</tspan> ${recipient}</text>
          <text x="125" y="840"><tspan font-weight="700">${copy.from} :</tspan> ${from}</text>
          <text x="125" y="882" font-weight="700">${copy.message} :</text>
          <text x="300" y="882" font-size="16" font-style="italic">${textSpans(message, 300, 882, 18)}</text>
        </g>
      </svg>`;
  }

  const message = wrapText(data.message, 45, 4);
  return `
    <svg width="1536" height="1024" viewBox="0 0 1536 1024" xmlns="http://www.w3.org/2000/svg">
      ${data.design === "thankYou" ? '<rect x="78" y="735" width="660" height="190" rx="18" fill="#fffdf7" fill-opacity="0.96" stroke="#bd8528" stroke-width="2"/>' : ""}
      <g font-family="Arial, sans-serif">
        <text x="410" y="337" text-anchor="middle" fill="#bd8528" font-size="${fontSizeFor(occasion, 39, 30, 20)}" font-weight="600" letter-spacing="5">${occasion}</text>
        <text x="400" y="510" text-anchor="middle" fill="#bd8528" font-size="${fontSizeFor(amount, 108, 78, 9)}" font-weight="800">${amount}</text>
        <text x="400" y="570" text-anchor="middle" fill="#171512" font-size="22">${validity}</text>
        <g fill="#171512" font-size="21">
          <text x="105" y="780"><tspan font-weight="700">${copy.recipient} :</tspan> ${recipient}</text>
          <text x="105" y="819"><tspan font-weight="700">${copy.from} :</tspan> ${from}</text>
          <text x="105" y="854" font-weight="700">${copy.message} :</text>
          <text x="275" y="854" font-size="17" font-style="italic">${textSpans(message, 275, 854, 19)}</text>
        </g>
      </g>
    </svg>`;
}

function buildGraphicsOverlay(data: GiftCardDocumentData) {
  return buildOverlay(data).replace(/<text\b[\s\S]*?<\/text>/g, "");
}

async function buildTextLayers(data: GiftCardDocumentData): Promise<OverlayOptions[]> {
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
  const recipient = escapeXml(data.recipient.slice(0, 40));
  const from = escapeXml(data.from.slice(0, 40));

  if (isCloudDesign(data.design)) {
    const palettes = {
      cloudBirthday: { text: "#fff9ec", accent: "#f0cf7a", amountText: "#781c2e" },
      cloudThankYou: { text: "#173f32", accent: "#b67b29", amountText: "#fff9ec" },
      cloudCongratulations: { text: "#fff9ec", accent: "#e3c366", amountText: "#063a2a" },
    } as const;
    const palette = palettes[data.design];
    const message = linesMarkup(wrapText(data.message, 46, 4));

    return Promise.all([
      textLayer({
        text: "CHÈQUE CADEAU",
        centerX: 480,
        baseline: 211,
        width: 530,
        size: 34,
        color: palette.text,
        align: "centre",
        bold: true,
        letterSpacing: 3,
      }),
      textLayer({
        text: occasion,
        centerX: 480,
        baseline: 278,
        width: 720,
        size: fontSizeFor(occasion, 45, 35, 22),
        color: palette.accent,
        align: "centre",
        bold: true,
        letterSpacing: 2,
      }),
      textLayer({
        text: amount,
        centerX: 480,
        baseline: 435,
        width: 720,
        size: fontSizeFor(amount, 108, 88, 10),
        color: palette.amountText,
        align: "centre",
        bold: true,
      }),
      textLayer({
        text: validity,
        centerX: 480,
        baseline: 548,
        width: 700,
        size: 23,
        color: palette.text,
        align: "centre",
      }),
      textLayer({
        text: `<b>${copy.recipient} :</b> ${recipient}`,
        left: 100,
        baseline: 657,
        width: 760,
        size: 27,
        color: palette.text,
      }),
      textLayer({
        text: `<b>${copy.from} :</b> ${from}`,
        left: 100,
        baseline: 718,
        width: 760,
        size: 27,
        color: palette.text,
      }),
      textLayer({
        text: `<b>${copy.message} :</b>`,
        left: 100,
        baseline: 779,
        width: 760,
        size: 27,
        color: palette.text,
      }),
      textLayer({
        text: message,
        left: 100,
        baseline: 812,
        width: 760,
        size: 24,
        color: palette.text,
        italic: true,
      }),
      textLayer({
        text: "welcome-coworking.com",
        left: 100,
        baseline: 957,
        width: 700,
        size: 20,
        color: palette.accent,
        letterSpacing: 2,
      }),
    ]);
  }

  if (data.design === "red" || data.design === "birthday") {
    const recipientLines = linesMarkup(wrapText(data.recipient, 34, 2));
    const fromLines = linesMarkup(wrapText(data.from, 34, 2));
    const message = linesMarkup(wrapText(data.message, 32, 5));
    return Promise.all([
      textLayer({
        text: occasion,
        centerX: 650,
        baseline: 573,
        width: 500,
        size: fontSizeFor(occasion, 42, 32, 20),
        color: "#9b1119",
        align: "centre",
        bold: true,
        letterSpacing: 2,
      }),
      textLayer({
        text: amount,
        centerX: 645,
        baseline: 704,
        width: 600,
        size: fontSizeFor(amount, 78, 60, 9),
        color: "#fff8e9",
        align: "centre",
        bold: true,
      }),
      textLayer({
        text: `<b>${copy.recipient} :</b>`,
        left: 1100,
        baseline: 554,
        width: 360,
        size: 22,
        color: "#94131a",
      }),
      textLayer({
        text: recipientLines,
        left: 1100,
        baseline: 584,
        width: 360,
        size: 20,
        color: "#94131a",
      }),
      textLayer({
        text: `<b>${copy.from} :</b>`,
        left: 1100,
        baseline: 646,
        width: 360,
        size: 22,
        color: "#94131a",
      }),
      textLayer({
        text: fromLines,
        left: 1100,
        baseline: 676,
        width: 360,
        size: 20,
        color: "#94131a",
      }),
      textLayer({
        text: `<b>${copy.message} :</b>`,
        left: 1100,
        baseline: 733,
        width: 360,
        size: 21,
        color: "#94131a",
      }),
      textLayer({
        text: message,
        left: 1100,
        baseline: 757,
        width: 360,
        size: 17,
        color: "#94131a",
        italic: true,
      }),
      textLayer({
        text: validity,
        centerX: 640,
        baseline: 798,
        width: 680,
        size: 21,
        color: "#2b1b14",
        align: "centre",
      }),
    ]);
  }

  if (data.design === "green" || data.design === "congratulations") {
    const message = linesMarkup(wrapText(data.message, 48, 4));
    return Promise.all([
      textLayer({
        text: occasion,
        centerX: 430,
        baseline: 307,
        width: 620,
        size: fontSizeFor(occasion, 42, 32, 20),
        color: "#fff9e8",
        align: "centre",
        bold: true,
        letterSpacing: 2,
      }),
      textLayer({
        text: amount,
        centerX: 420,
        baseline: 470,
        width: 620,
        size: fontSizeFor(amount, 102, 78, 9),
        color: "#063a2a",
        align: "centre",
        bold: true,
      }),
      textLayer({
        text: validity,
        centerX: 430,
        baseline: 576,
        width: 620,
        size: 22,
        color: "#fff9e8",
        align: "centre",
      }),
      textLayer({
        text: `<b>${copy.recipient} :</b> ${recipient}`,
        left: 125,
        baseline: 804,
        width: 650,
        size: 20,
        color: "#171512",
      }),
      textLayer({
        text: `<b>${copy.from} :</b> ${from}`,
        left: 125,
        baseline: 840,
        width: 650,
        size: 20,
        color: "#171512",
      }),
      textLayer({
        text: `<b>${copy.message} :</b>`,
        left: 125,
        baseline: 882,
        width: 175,
        size: 20,
        color: "#171512",
      }),
      textLayer({
        text: message,
        left: 300,
        baseline: 882,
        width: 510,
        size: 16,
        color: "#171512",
        italic: true,
      }),
    ]);
  }

  const message = linesMarkup(wrapText(data.message, 45, 4));
  return Promise.all([
    textLayer({
      text: occasion,
      centerX: 410,
      baseline: 337,
      width: 620,
      size: fontSizeFor(occasion, 39, 30, 20),
      color: "#bd8528",
      align: "centre",
      bold: true,
      letterSpacing: 4,
    }),
    textLayer({
      text: amount,
      centerX: 400,
      baseline: 510,
      width: 620,
      size: fontSizeFor(amount, 108, 78, 9),
      color: "#bd8528",
      align: "centre",
      bold: true,
    }),
    textLayer({
      text: validity,
      centerX: 400,
      baseline: 570,
      width: 620,
      size: 22,
      color: "#171512",
      align: "centre",
    }),
    textLayer({
      text: `<b>${copy.recipient} :</b> ${recipient}`,
      left: 105,
      baseline: 780,
      width: 650,
      size: 21,
      color: "#171512",
    }),
    textLayer({
      text: `<b>${copy.from} :</b> ${from}`,
      left: 105,
      baseline: 819,
      width: 650,
      size: 21,
      color: "#171512",
    }),
    textLayer({
      text: `<b>${copy.message} :</b>`,
      left: 105,
      baseline: 854,
      width: 170,
      size: 21,
      color: "#171512",
    }),
    textLayer({
      text: message,
      left: 275,
      baseline: 854,
      width: 500,
      size: 17,
      color: "#171512",
      italic: true,
    }),
  ]);
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
  const textLayers = await buildTextLayers(data);
  let jpeg: Buffer;

  if (isCloudDesign(data.design)) {
    const photo = await sharp(template).resize({ height: 1024 }).png().toBuffer();
    const logoSource = await readFile(
      join(process.cwd(), "src", "assets", "welcome-logo-cropped.png"),
    );
    const logo = await sharp(logoSource).resize({ width: 330 }).png().toBuffer();
    const photoMetadata = await sharp(photo).metadata();
    const photoWidth = photoMetadata.width ?? 576;

    jpeg = await sharp({
      create: {
        width: 1536,
        height: 1024,
        channels: 3,
        background: "#000000",
      },
    })
      .composite([
        { input: photo, top: 0, left: 1536 - photoWidth },
        { input: Buffer.from(buildGraphicsOverlay(data)), top: 0, left: 0 },
        { input: logo, top: 82, left: 115 },
        ...textLayers,
      ])
      .jpeg({ quality: 94, chromaSubsampling: "4:4:4" })
      .toBuffer();
  } else {
    jpeg = await sharp(template)
      .composite([
        { input: Buffer.from(buildGraphicsOverlay(data)), top: 0, left: 0 },
        ...textLayers,
      ])
      .jpeg({ quality: 94, chromaSubsampling: "4:4:4" })
      .toBuffer();
  }

  return jpegToPdf(jpeg, 1536, 1024);
}
