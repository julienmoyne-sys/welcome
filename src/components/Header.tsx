import Link from "next/link";
import { WelcomeLogo } from "./WelcomeLogo";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { label: "Espaces", hash: "espaces" },
  { label: "Solutions", hash: "solutions" },
  { label: "Références", hash: "references" },
  { label: "Accès", hash: "acces" },
  { label: "Contact", hash: "contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-welcome-line bg-welcome-header">
      <div className="mx-auto flex h-[90px] max-w-[1400px] items-center justify-between px-6 lg:px-10">
        {/* `next/link` remet l'URL à « / » (hash compris) et remonte en haut de page :
            le gestionnaire de clic manuel du routeur précédent n'est plus nécessaire. */}
        <Link href="/" className="shrink-0" aria-label="Welcome Coworking — accueil">
          <WelcomeLogo className="w-[210px]" />
        </Link>

        <nav className="hidden items-center gap-10 lg:flex lg:gap-14">
          {navLinks.map((link) => (
            <Link
              key={link.hash}
              href={`/#${link.hash}`}
              className="font-manrope text-[16px] font-semibold text-welcome-black transition-opacity duration-200 hover:opacity-60"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 sm:gap-6">
          <ThemeToggle />
          <Link
            href="/#contact"
            className="hidden h-[48px] items-center justify-center rounded-[12px] bg-welcome-gold px-4 font-manrope text-[15px] font-semibold text-[#0b0b0b] transition-all duration-200 hover:brightness-105 hover:shadow-lg md:inline-flex md:px-6 md:text-[16px]"
          >
            Organiser une visite
          </Link>
        </div>
      </div>
    </header>
  );
}
