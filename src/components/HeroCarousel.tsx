"use client";

import Image, { type StaticImageData } from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import coworkingLounge from "@/assets/hero-coworking-lounge-desktop-4k.jpg";
import meetingRoom from "@/assets/hero-meeting-room-desktop-4k.jpg";
import mobilePrivateOffice from "@/assets/hero-private-office-clouds-mobile.png";
import privateOffice from "@/assets/hero-private-office-desktop-4k.jpg";

const slides: Array<{ image: StaticImageData; position: string }> = [
  { image: coworkingLounge, position: "object-center" },
  { image: privateOffice, position: "object-center" },
  { image: meetingRoom, position: "object-center" },
];

type HeroCarouselProps = {
  alts: string[];
  previousLabel: string;
  nextLabel: string;
  slideLabel: string;
};

export function HeroCarousel({ alts, previousLabel, nextLabel, slideLabel }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const showPrevious = useCallback(() => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }, []);

  const showNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const interval = window.setInterval(showNext, 5_000);
    return () => window.clearInterval(interval);
  }, [isPaused, showNext]);

  return (
    <>
      <Image
        src={mobilePrivateOffice}
        alt={alts[1] ?? ""}
        fill
        fetchPriority="high"
        loading="eager"
        sizes="(max-width: 767px) 100vw, 1px"
        quality={75}
        className="welcome-photo welcome-hero-photo object-cover object-center md:hidden"
      />

      <div
        className="absolute inset-0 hidden md:block"
        role="region"
        aria-roledescription="carousel"
        aria-label={slideLabel}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
        }}
      >
        <div className="absolute inset-0 overflow-hidden" aria-live="off">
          {slides.map(({ image, position }, index) => {
            const isActive = index === activeIndex;

            return (
              <Image
                key={image.src}
                src={image}
                alt={isActive ? (alts[index] ?? "") : ""}
                fill
                fetchPriority={index === 0 ? "high" : "auto"}
                loading="eager"
                sizes="(max-width: 767px) 1px, 100vw"
                quality={75}
                aria-hidden={!isActive}
                className={`welcome-photo welcome-hero-photo object-cover ${position} transition-opacity duration-700 ease-out motion-reduce:transition-none ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />
            );
          })}
        </div>

        <div className="absolute bottom-8 right-10 z-30 flex items-center gap-3">
          <button
            type="button"
            onClick={showPrevious}
            aria-label={previousLabel}
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/50 bg-black/45 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-welcome-gold"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>

          <div className="flex items-center gap-2 rounded-full border border-white/40 bg-black/45 px-3 py-2.5 shadow-lg backdrop-blur-sm">
            {slides.map((slide, index) => (
              <button
                key={slide.image.src}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`${slideLabel} ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className={`size-2.5 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-welcome-gold ${
                  index === activeIndex ? "w-6 bg-welcome-gold" : "bg-white/75 hover:bg-white"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={showNext}
            aria-label={nextLabel}
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/50 bg-black/45 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-welcome-gold"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>
    </>
  );
}
