import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 3600;

const SUPPORTED_CURRENCIES = new Set(["AUD", "CAD", "CHF", "CNY", "GBP", "JPY", "KRW", "USD"]);

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += character;
    }
  }
  values.push(current);
  return values;
}

export async function GET(request: Request) {
  const currency = new URL(request.url).searchParams.get("currency")?.toUpperCase() ?? "USD";
  if (!SUPPORTED_CURRENCIES.has(currency)) {
    return NextResponse.json({ status: "unsupported-currency" }, { status: 400 });
  }

  const endpoint =
    `https://data-api.ecb.europa.eu/service/data/EXR/D.${currency}.EUR.SP00.A` +
    "?lastNObservations=1&detail=dataonly&format=csvdata";

  try {
    const response = await fetch(endpoint, {
      headers: { Accept: "text/csv" },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`ECB ${response.status}`);

    const lines = (await response.text()).trim().split(/\r?\n/);
    if (lines.length < 2) throw new Error("ECB response is empty");
    const headers = parseCsvLine(lines[0]);
    const values = parseCsvLine(lines.at(-1) ?? "");
    const date = values[headers.indexOf("TIME_PERIOD")];
    const rate = Number(values[headers.indexOf("OBS_VALUE")]);
    if (!date || !Number.isFinite(rate)) throw new Error("ECB response is invalid");

    return NextResponse.json(
      { status: "ready", base: "EUR", currency, rate, date, source: "BCE" },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
    );
  } catch (error) {
    console.error("Unable to load ECB exchange rate", error);
    return NextResponse.json({ status: "upstream-error" }, { status: 502 });
  }
}
