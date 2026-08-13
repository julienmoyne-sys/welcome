"use client";

import { TrainFront, Bike, Car, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useReveal } from "../hooks/useReveal";
import logoRond from "../assets/welcome-logo-rond.jpg";

// L'ordre des icônes suit celui du tableau `access.cards` des messages.
const CARD_ICONS = [TrainFront, Bike, Car, Trophy];

/** Position de chaque repère sur la carte schématique, indépendante de la langue. */
const MAP_NODES = [
  { key: "center", x: 300, y: 58, align: "center" as const },
  { key: "illkirch", x: 300, y: 400, align: "center" as const },
  { key: "motorway", x: 74, y: 252, align: "start" as const },
  { key: "stadium", x: 526, y: 252, align: "end" as const },
  { key: "tram", x: 360, y: 170, align: "start" as const },
];

function MapIllustration({ visible }: { visible: boolean }) {
  const t = useTranslations("access.map");
  const nodes = MAP_NODES.map((node) => ({
    ...node,
    label: t(`nodes.${node.key}.label`),
    sub: t(`nodes.${node.key}.sub`),
  }));

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-welcome-black/[0.07] bg-welcome-white p-4 shadow-[0_18px_50px_-30px_rgba(11,11,11,0.28)] sm:p-8">
      <svg viewBox="0 0 600 460" className="h-auto w-full" role="img" aria-label={t("ariaLabel")}>
        {/* subtle grid */}
        <g stroke="var(--welcome-black)" strokeOpacity="0.04">
          {Array.from({ length: 11 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={460} />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 60} x2={600} y2={i * 60} />
          ))}
        </g>

        {/* connection lines */}
        <g
          stroke="var(--welcome-gold)"
          strokeWidth="1.25"
          strokeLinecap="round"
          fill="none"
          style={{
            strokeDasharray: 420,
            strokeDashoffset: visible ? 0 : 420,
            transition: "stroke-dashoffset 1.6s ease-out",
          }}
        >
          <line x1="300" y1="230" x2="300" y2="92" />
          <line x1="300" y1="230" x2="300" y2="374" />
          <line x1="300" y1="230" x2="108" y2="230" />
          <line x1="300" y1="230" x2="492" y2="230" />
        </g>

        {/* satellite dots */}
        <g>
          {[
            [300, 88],
            [300, 378],
            [104, 230],
            [496, 230],
          ].map(([x, y]) => (
            <circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r="5"
              fill="var(--welcome-white)"
              stroke="var(--welcome-gold)"
              strokeWidth="1.5"
            />
          ))}
        </g>

        {/* center Welcome logo */}
        <g
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.8s ease-out 0.3s",
          }}
        >
          <circle cx="300" cy="230" r="66" fill="#0b0b0b" />
          <circle
            cx="300"
            cy="230"
            r="48"
            fill="#0b0b0b"
            stroke="var(--welcome-gold)"
            strokeWidth="1.75"
          />
          <image
            x="252"
            y="182"
            width="96"
            height="96"
            // Balise SVG `<image>`, pas un `<img>` HTML : `next/image` ne peut pas
            // s'y substituer. L'import statique fournit tout de même une URL
            // versionnée et empreintée par le build.
            href={logoRond.src}
            clipPath="url(#logoRondClip)"
            preserveAspectRatio="xMidYMid slice"
          />
          <defs>
            <clipPath id="logoRondClip">
              <circle cx="300" cy="230" r="48" />
            </clipPath>
          </defs>
        </g>

        {/* labels */}
        <g
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.9s ease-out 0.6s",
          }}
        >
          {nodes.map((n) => (
            <g key={n.label}>
              <text
                x={n.x}
                y={n.y}
                textAnchor={n.align === "center" ? "middle" : n.align === "start" ? "start" : "end"}
                className="font-manrope"
                fontSize="14"
                fontWeight="600"
                fill="var(--welcome-black)"
              >
                {n.label}
              </text>
              <text
                x={n.x}
                y={n.y + 19}
                textAnchor={n.align === "center" ? "middle" : n.align === "start" ? "start" : "end"}
                className="font-inter"
                fontSize="12.5"
                fill="var(--welcome-body)"
                fillOpacity="0.7"
              >
                {n.sub}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

export function AccessSection() {
  const t = useTranslations("access");
  const cards = t.raw("cards") as { title: string; text: string }[];
  const header = useReveal<HTMLDivElement>();
  const grid = useReveal<HTMLDivElement>();
  const bottom = useReveal<HTMLDivElement>();

  return (
    <section className="bg-welcome-cream py-24 sm:py-28 lg:py-[140px]">
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-10">
        <div
          ref={header.ref}
          className="max-w-3xl transition-all duration-700 ease-out"
          style={{
            opacity: header.visible ? 1 : 0,
            transform: header.visible ? "none" : "translateY(16px)",
          }}
        >
          <p
            id="acces"
            className="scroll-mt-[120px] font-inter text-[15px] font-medium uppercase tracking-[0.12em] text-welcome-sage"
          >
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 font-manrope text-[36px] font-bold leading-[1.12] tracking-tight text-welcome-black sm:text-[42px] lg:text-[52px]">
            {t("titleLead")} <span className="text-welcome-gold">{t("titleHighlight")}</span>
          </h2>
          <p className="mt-6 max-w-2xl font-inter text-lg leading-[1.7] text-welcome-body">
            {t("lead")}
          </p>
        </div>

        <div ref={grid.ref} className="mt-16 flex flex-col gap-10 lg:mt-20 lg:flex-row lg:gap-12">
          <div
            className="w-full transition-all duration-700 ease-out lg:w-[60%]"
            style={{
              opacity: grid.visible ? 1 : 0,
              transform: grid.visible ? "none" : "translateY(20px)",
            }}
          >
            <MapIllustration visible={grid.visible} />
          </div>

          <div className="flex w-full flex-col gap-5 lg:w-[40%]">
            {cards.map(({ title, text }, i) => {
              const Icon = CARD_ICONS[i];
              return (
                <div
                  key={title}
                  className="group rounded-[20px] border border-welcome-black/[0.07] bg-welcome-white p-6 shadow-[0_10px_30px_-24px_rgba(11,11,11,0.35)] transition-all duration-300 ease-out hover:-translate-y-[3px] hover:shadow-[0_18px_40px_-24px_rgba(11,11,11,0.35)]"
                  style={{
                    opacity: grid.visible ? 1 : 0,
                    transform: grid.visible ? "none" : "translateY(20px)",
                    transitionDelay: `${150 + i * 110}ms`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <span className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-welcome-gold/10">
                      <Icon className="h-5 w-5 text-welcome-gold" strokeWidth={1.5} />
                    </span>
                    <div>
                      <h3 className="font-manrope text-[17px] font-semibold text-welcome-black">
                        {title}
                      </h3>
                      <p className="mt-2 font-inter text-[15px] leading-[1.6] text-welcome-body/80">
                        {text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          ref={bottom.ref}
          className="mt-16 transition-all duration-700 ease-out lg:mt-24"
          style={{
            opacity: bottom.visible ? 1 : 0,
            transform: bottom.visible ? "none" : "translateY(20px)",
          }}
        >
          <div className="relative overflow-hidden rounded-[20px] border border-welcome-black/[0.07] shadow-[0_18px_50px_-30px_rgba(11,11,11,0.28)]">
            <iframe
              title={t("mapTitle")}
              src="https://www.google.com/maps?q=204+Avenue+de+Colmar,+67100+Strasbourg&output=embed&z=13"
              className="welcome-map h-[420px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/#contact"
              className="inline-flex h-[52px] items-center justify-center rounded-[12px] bg-welcome-gold px-8 font-manrope text-[16px] font-semibold text-[#0b0b0b] transition-all duration-200 hover:brightness-105 hover:shadow-lg active:scale-[0.99]"
            >
              {t("ctaVisit")}
            </Link>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=204%20avenue%20de%20Colmar%2C%2067100%20Strasbourg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[52px] items-center justify-center rounded-[12px] border border-welcome-black/20 bg-transparent px-8 font-manrope text-[16px] font-semibold text-welcome-black transition-all duration-200 hover:bg-welcome-black hover:text-welcome-ink-fg active:scale-[0.99]"
            >
              {t("ctaRoute")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
