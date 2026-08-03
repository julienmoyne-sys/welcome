"use client";

import Image from "next/image";
import { Trophy } from "lucide-react";
import { useReveal } from "../hooks/useReveal";
import { GoogleReviews } from "./GoogleReviews";

import caisy from "../assets/clients/CAISY.png";
import rcsa from "../assets/clients/RCSA.png";
import agitomed from "../assets/clients/agitomed.png";
import axeal from "../assets/clients/axeal.png";
import batisante from "../assets/clients/batisante.png";
import bluelink from "../assets/clients/bluelink.png";
import capvision from "../assets/clients/capvision68b.png";
import datasolution from "../assets/clients/datasolutionfr.png";
import herbalife from "../assets/clients/herbalife.png";
import just from "../assets/clients/just.png";
import kairos from "../assets/clients/kairos.png";
import karlsbrau from "../assets/clients/karlsbrausaverne.png";
import liins from "../assets/clients/liins.png";
import loreal from "../assets/clients/loreal.png";
import seloger from "../assets/clients/selogerpointcom.png";
import sypro from "../assets/clients/sypro.png";
import teleperformance from "../assets/clients/teleperformance.png";
import urbanis from "../assets/clients/urbanis.png";

const clientLogos = [
  { name: "Caisy", src: caisy },
  { name: "RCSA", src: rcsa },
  { name: "Agitomed", src: agitomed },
  { name: "Axeal", src: axeal },
  { name: "Batisanté", src: batisante },
  { name: "Bluelink", src: bluelink },
  { name: "Capvision", src: capvision },
  { name: "Data Solution", src: datasolution },
  { name: "Herbalife", src: herbalife },
  { name: "Just", src: just },
  { name: "Kairos", src: kairos },
  { name: "Karlsbräu", src: karlsbrau },
  { name: "Liins", src: liins },
  { name: "L'Oréal", src: loreal },
  { name: "SeLoger.com", src: seloger },
  { name: "Sypro", src: sypro },
  { name: "Teleperformance", src: teleperformance },
  { name: "Urbanis", src: urbanis },
];

export function ReferencesSection() {
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="bg-welcome-white py-24 sm:py-28 lg:py-[120px]">
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-10">
        {/* Header */}
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <p
            id="references"
            className="scroll-mt-[120px] font-inter text-[15px] font-medium uppercase tracking-[0.12em] text-welcome-sage"
          >
            Références
          </p>
          <h2 className="mt-4 font-manrope text-4xl font-semibold leading-[1.12] tracking-tight text-welcome-black md:text-5xl">
            Ils nous ont fait <span className="text-welcome-gold">confiance</span>.
          </h2>
        </div>

        {/* Logo carousel */}
        <div
          className="welcome-marquee relative mt-16 overflow-hidden rounded-2xl bg-welcome-white p-6 shadow-[0_2px_24px_rgba(11,11,11,0.05)] ring-1 ring-welcome-black/5"
          aria-label="Clients ayant choisi Welcome Coworking"
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-welcome-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-welcome-white to-transparent" />
          <div className="welcome-marquee-track flex w-max items-center gap-6 lg:gap-8">
            {[...clientLogos, ...clientLogos].map((logo, i) => (
              <div
                key={`${logo.name}-${i}`}
                className="flex h-[120px] w-[220px] shrink-0 items-center justify-center rounded-xl bg-welcome-white"
              >
                {/* La seconde moitié du défilement est un doublon décoratif. */}
                <Image
                  src={logo.src}
                  alt={i >= clientLogos.length ? "" : `Logo ${logo.name}`}
                  aria-hidden={i >= clientLogos.length}
                  sizes="220px"
                  className="max-h-[104px] w-auto max-w-full object-contain opacity-80 grayscale transition-all duration-300 hover:scale-105 hover:opacity-100 hover:grayscale-0 dark:opacity-95 dark:invert"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Stats line */}
        <p className="mt-10 text-center font-inter text-[17px] leading-[1.7] text-welcome-body/80">
          Plus de <span className="font-semibold text-welcome-black">100 entreprises</span>{" "}
          accompagnées depuis <span className="font-semibold text-welcome-black">2017</span>.
        </p>

        {/* Awards */}
        <div className="mx-auto mt-16 flex max-w-2xl flex-col gap-5">
          <a
            href="https://www.coworker.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-5 rounded-2xl bg-welcome-white p-5 shadow-[0_2px_24px_rgba(11,11,11,0.05)] ring-1 ring-welcome-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(11,11,11,0.08)] sm:gap-6 sm:p-6"
          >
            <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl bg-welcome-gold/10 text-welcome-gold">
              <Trophy size={22} strokeWidth={2} />
              <span className="font-manrope text-xs font-bold">2019</span>
            </span>
            <div>
              <p className="font-manrope text-base font-semibold leading-snug text-welcome-black sm:text-lg">
                Élu meilleur espace de coworking à Strasbourg
              </p>
              <p className="mt-1 font-inter text-[15px] text-welcome-body/70">
                par les utilisateurs du site{" "}
                <span className="font-medium text-welcome-gold underline-offset-2 group-hover:underline">
                  coworker.com
                </span>
              </p>
            </div>
          </a>

          <a
            href="https://desk.community/blog/article/meilleurs-espaces-coworking-strasbourg"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-5 rounded-2xl bg-welcome-white p-5 shadow-[0_2px_24px_rgba(11,11,11,0.05)] ring-1 ring-welcome-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(11,11,11,0.08)] sm:gap-6 sm:p-6"
          >
            <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl bg-welcome-gold/10 text-welcome-gold">
              <Trophy size={22} strokeWidth={2} />
              <span className="font-manrope text-xs font-bold">2026</span>
            </span>
            <div>
              <p className="font-manrope text-base font-semibold leading-snug text-welcome-black sm:text-lg">
                Classé 2ème meilleur espace de coworking à Strasbourg
              </p>
              <p className="mt-1 font-inter text-[15px] text-welcome-body/70">
                par le site{" "}
                <span className="font-medium text-welcome-gold underline-offset-2 group-hover:underline">
                  Desk
                </span>
              </p>
            </div>
          </a>
        </div>

        {/* Google Reviews widget */}
        <div className="mt-20">
          <GoogleReviews />
        </div>
      </div>
    </section>
  );
}
