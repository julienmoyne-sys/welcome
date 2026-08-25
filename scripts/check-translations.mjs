import { readFileSync } from "node:fs";

const LOCALES = ["fr", "en", "de"];
const CATALOGUES = [
  (locale) => `messages/${locale}.json`,
  (locale) => `messages/faq/${locale}.json`,
  (locale) => `messages/legal/${locale}.json`,
];
const errors = [];

function readJson(path) {
  return JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
}

function richTextTokens(value) {
  return [...value.matchAll(/\{[^}]+\}|<\/?[a-zA-Z][^>]*>/g)]
    .map(([token]) => token.replace(/<([^\s/>]+)[^>]*>/, "<$1>").replace(/<\/([^>]+)>/, "</$1>"))
    .sort();
}

function compareCatalogue(reference, translation, locale, path = "") {
  if (Array.isArray(reference)) {
    if (!Array.isArray(translation) || reference.length !== translation.length) {
      errors.push(`${locale}: tableau différent à ${path || "<racine>"}`);
      return;
    }
    reference.forEach((value, index) =>
      compareCatalogue(value, translation[index], locale, `${path}[${index}]`),
    );
    return;
  }

  if (reference && typeof reference === "object") {
    if (!translation || typeof translation !== "object" || Array.isArray(translation)) {
      errors.push(`${locale}: objet manquant à ${path || "<racine>"}`);
      return;
    }
    const referenceKeys = Object.keys(reference).sort();
    const translationKeys = Object.keys(translation).sort();
    if (referenceKeys.join("\0") !== translationKeys.join("\0")) {
      errors.push(`${locale}: clés différentes à ${path || "<racine>"}`);
      return;
    }
    referenceKeys.forEach((key) =>
      compareCatalogue(reference[key], translation[key], locale, path ? `${path}.${key}` : key),
    );
    return;
  }

  if (typeof reference !== typeof translation) {
    errors.push(`${locale}: type différent à ${path}`);
  } else if (
    typeof reference === "string" &&
    richTextTokens(reference).join("\0") !== richTextTokens(translation).join("\0")
  ) {
    errors.push(`${locale}: variables ou balises différentes à ${path}`);
  }
}

for (const cataloguePath of CATALOGUES) {
  const reference = readJson(cataloguePath("fr"));
  for (const locale of LOCALES.slice(1)) {
    compareCatalogue(reference, readJson(cataloguePath(locale)), locale);
  }
}

const messages = Object.fromEntries(
  LOCALES.map((locale) => [locale, readJson(`messages/${locale}.json`)]),
);
const expectedCommercialContent = {
  fr: {
    comparisonDescription: "Flex, Flex+, Open Space et Bureau privatif",
    secondPlan: ["Nomade", "Flex+", "90 €"],
    flexHours: "lun. à ven. 8h-18h",
    nomadPlans: "Flex ou Flex+",
  },
  en: {
    comparisonDescription: "Flex, Flex+, Open Space and Private Office",
    secondPlan: ["Nomad", "Flex+", "€90"],
    flexHours: "Mon–Fri, 8 am–6 pm",
    nomadPlans: "Flex or Flex+",
  },
  de: {
    comparisonDescription: "Flex, Flex+, Open Space und privates Büro",
    secondPlan: ["Nomade", "Flex+", "90 €"],
    flexHours: "Mo.–Fr., 8–18 Uhr",
    nomadPlans: "Flex oder Flex+",
  },
};

for (const locale of LOCALES) {
  const catalogue = messages[locale];
  const expected = expectedCommercialContent[locale];
  const plan = catalogue.comparisonTable.plans[1];
  const actualPlan = [plan.kicker, plan.name, plan.price];

  if (!catalogue.metadata.comparison.description.includes(expected.comparisonDescription)) {
    errors.push(`${locale}: les formules de la meta description du comparatif divergent`);
  }
  if (actualPlan.join("\0") !== expected.secondPlan.join("\0")) {
    errors.push(`${locale}: la formule Flex+ du comparatif diverge`);
  }
  for (const cellIndex of [0, 1]) {
    if (catalogue.comparisonTable.groups[0].rows[2].cells[cellIndex].label !== expected.flexHours) {
      errors.push(`${locale}: les horaires Flex/Flex+ du comparatif divergent`);
    }
  }
  if (catalogue.pricing.plans.nomad.features[0] !== expected.nomadPlans) {
    errors.push(`${locale}: les noms des formules Nomade divergent`);
  }
}

if (errors.length > 0) {
  console.error(`Échec de synchronisation des traductions :\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log("Traductions FR/EN/DE synchronisées.");
