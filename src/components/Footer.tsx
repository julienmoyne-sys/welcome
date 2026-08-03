import { Facebook, Instagram, Linkedin } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { SITE_SOCIAL_LINKS } from "@/lib/seo";

/** Clé de traduction ↔ chemin, l'ordre du tableau étant l'ordre d'affichage. */
const LEGAL_LINKS = [
  { key: "mentionsLegales", href: "/mentions-legales" },
  { key: "cgu", href: "/conditions-generales-d-utilisation" },
  { key: "confidentialite", href: "/politique-de-confidentialite" },
  { key: "cookies", href: "/politique-de-cookies" },
  { key: "gestionCookies", href: "/gestion-des-cookies" },
  { key: "accessibilite", href: "/declaration-d-accessibilite" },
] as const;

const SOCIAL_ICONS = [
  { icon: Linkedin, label: "LinkedIn", href: SITE_SOCIAL_LINKS[2] },
  { icon: Instagram, label: "Instagram", href: SITE_SOCIAL_LINKS[1] },
  { icon: Facebook, label: "Facebook", href: SITE_SOCIAL_LINKS[0] },
];

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-welcome-footer-bg text-welcome-footer-text">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center px-6 pb-10 pt-16 lg:px-10">
        <Link
          href="/faq"
          className="mb-10 text-center font-manrope text-[15px] font-semibold text-welcome-footer-text transition-colors duration-200 hover:text-welcome-gold"
        >
          {t("faqLink")}
        </Link>

        <div className="flex items-center gap-6">
          {SOCIAL_ICONS.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="group inline-flex h-14 w-14 items-center justify-center rounded-full border border-welcome-white/15 text-welcome-footer-text transition-all duration-200 hover:-translate-y-1 hover:border-welcome-gold hover:text-welcome-gold"
              >
                <Icon size={26} strokeWidth={1.5} aria-hidden="true" />
              </a>
            );
          })}
        </div>

        <nav className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          {LEGAL_LINKS.map((link, index) => (
            <span key={link.key} className="inline-flex items-center gap-3">
              <Link
                href={link.href}
                className="font-inter text-[13px] text-welcome-footer-muted transition-colors duration-200 hover:text-welcome-gold"
              >
                {t(`legal.${link.key}`)}
              </Link>
              {index < LEGAL_LINKS.length - 1 && (
                <span className="text-welcome-footer-muted/40" aria-hidden="true">
                  ·
                </span>
              )}
            </span>
          ))}
        </nav>

        <div className="mt-10 h-px w-full max-w-[320px] bg-welcome-white/10" />

        <p className="mt-8 text-center font-inter text-[13px] font-normal text-[#A0A0A0]">
          {t("copyright")}
        </p>
      </div>
    </footer>
  );
}
