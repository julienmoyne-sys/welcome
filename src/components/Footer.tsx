import Link from "next/link";
import { Linkedin, Instagram, Facebook } from "lucide-react";

const legalLinks = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "CGU", href: "/conditions-generales-d-utilisation" },
  { label: "Politique de confidentialité", href: "/politique-de-confidentialite" },
  { label: "Politique de cookies", href: "/politique-de-cookies" },
  { label: "Gestion des cookies", href: "/gestion-des-cookies" },
  { label: "Accessibilité", href: "/declaration-d-accessibilite" },
];

const socialLinks = [
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/buzz-capital-moyne/" },
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://www.instagram.com/welcome_coworking_strasbourg/",
  },
  { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/WelcomeCoworking" },
];

export function Footer() {
  return (
    <footer className="bg-welcome-footer-bg text-welcome-footer-text">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center px-6 pb-10 pt-16 lg:px-10">
        {/* FAQ link */}
        <Link
          href="/faq"
          className="mb-10 text-center font-manrope text-[15px] font-semibold text-welcome-footer-text transition-colors duration-200 hover:text-welcome-gold"
        >
          Questions fréquentes / Frequently Asked Questions (FAQ)
        </Link>

        {/* Social networks */}
        <div className="flex items-center gap-6">
          {socialLinks.map((social) => {
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

        {/* Legal links */}
        <nav className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          {legalLinks.map((link, index) => (
            <span key={link.label} className="inline-flex items-center gap-3">
              <Link
                href={link.href}
                className="font-inter text-[13px] text-welcome-footer-muted transition-colors duration-200 hover:text-welcome-gold"
              >
                {link.label}
              </Link>
              {index < legalLinks.length - 1 && (
                <span className="text-welcome-footer-muted/40" aria-hidden="true">
                  ·
                </span>
              )}
            </span>
          ))}
        </nav>

        {/* Subtle separator */}
        <div className="mt-10 h-px w-full max-w-[320px] bg-welcome-white/10" />

        {/* Copyright */}
        <p className="mt-8 text-center font-inter text-[13px] font-normal text-[#A0A0A0]">
          © 2026 Welcome Coworking – Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
