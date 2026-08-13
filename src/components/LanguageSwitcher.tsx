"use client";

import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/i18n/routing";

/**
 * Sélecteur de langue.
 *
 * `usePathname` de next-intl renvoie le chemin **sans** préfixe de langue : on peut
 * donc basculer de langue en restant sur la même page. Aucun segment dynamique à
 * repasser ici, toutes les routes du site sont statiques.
 */
export function LanguageSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{t("languageLabel")}</span>
      {/* Le drapeau vient du texte de l'option sélectionnée ; ce chevron rétablit
          l'affordance de liste déroulante que `appearance-none` supprime. */}
      <ChevronDown
        aria-hidden="true"
        strokeWidth={2}
        className="pointer-events-none absolute right-2 h-[14px] w-[14px] text-welcome-black/50"
      />
      <select
        value={locale}
        disabled={isPending}
        onChange={(event) => {
          const next = event.target.value as Locale;
          startTransition(() => {
            router.replace(pathname, { locale: next });
          });
        }}
        className="cursor-pointer appearance-none rounded-[10px] border border-welcome-line bg-transparent py-1.5 pr-7 pl-2.5 font-manrope text-[14px] font-semibold text-welcome-black outline-none transition-colors focus-visible:ring-2 focus-visible:ring-welcome-gold disabled:opacity-60 [&>option]:bg-white [&>option]:text-black"
      >
        {LOCALES.map((code) => (
          <option key={code} value={code}>
            {LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
