"use client";

import Image from "next/image";
import {
  BadgeCheck,
  CalendarDays,
  Coffee,
  DoorOpen,
  Gift,
  Info,
  MessageSquareText,
  Printer,
  QrCode,
  Sparkles,
  Wifi,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import heroImage from "@/assets/hero-welcome-real.png";
import logo from "@/assets/welcome-logo-cropped.png";

import { DISPLAY_ANNOUNCEMENT, DISPLAY_REFRESH_MS, DISPLAY_SLIDES } from "./config";
import styles from "./display.module.css";
import type { DisplayEventsResponse, DisplaySlideId } from "./types";

const services = [
  { icon: Wifi, label: "Wi-Fi haut débit" },
  { icon: Coffee, label: "Café & thé" },
  { icon: DoorOpen, label: "Espaces de réunion" },
  { icon: Printer, label: "Impressions" },
  { icon: BadgeCheck, label: "Services professionnels" },
  { icon: Gift, label: "Avantages membres" },
];

function Brand({ light = true }: { light?: boolean }) {
  return (
    <Image
      src={logo}
      alt="Welcome! Coworking"
      className={light ? styles.logoLight : styles.logo}
      width={330}
      priority
    />
  );
}

export function DisplayScreen({ initialEvents }: { initialEvents: DisplayEventsResponse }) {
  const [now, setNow] = useState<Date | null>(null);
  const [eventsData, setEventsData] = useState(initialEvents);
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = useMemo(
    () =>
      DISPLAY_SLIDES.filter(
        (slide) => slide.enabled && (slide.id !== "today" || eventsData.events.length > 0),
      ),
    [eventsData.events.length],
  );

  useEffect(() => {
    const initialClock = window.setTimeout(() => setNow(new Date()), 0);
    const clock = window.setInterval(() => setNow(new Date()), 1_000);
    return () => {
      window.clearTimeout(initialClock);
      window.clearInterval(clock);
    };
  }, []);

  useEffect(() => {
    const refresh = async () => {
      try {
        const response = await fetch("/api/display/events", { cache: "no-store" });
        if (response.ok) setEventsData((await response.json()) as DisplayEventsResponse);
      } catch {
        // Une coupure réseau ne doit jamais interrompre l'affichage : on garde le dernier état connu.
      }
    };
    void refresh();
    const polling = window.setInterval(refresh, DISPLAY_REFRESH_MS);
    return () => window.clearInterval(polling);
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const current = slides[activeIndex % slides.length];
    const rotation = window.setTimeout(
      () => setActiveIndex((index) => (index + 1) % slides.length),
      current.durationMs,
    );
    return () => window.clearTimeout(rotation);
  }, [activeIndex, slides]);

  const visibleIndex = slides.length > 0 ? activeIndex % slides.length : 0;

  const time = now?.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) ?? "--:--";
  const date = now?.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const content: Record<DisplaySlideId, React.ReactNode> = {
    welcome: (
      <div className={styles.welcomeSlide}>
        <div className={styles.welcomeCopy}>
          <Brand />
          <p className={styles.eyebrow}>Coworking · Strasbourg</p>
          <h1>Bienvenue chez Welcome!</h1>
          <p className={styles.lead}>Le prolongement de votre chez vous.</p>
        </div>
        <div className={styles.clock} aria-label={`${time}, ${date ?? ""}`}>
          <span>{time}</span>
          <small>{date}</small>
        </div>
      </div>
    ),
    today: (
      <div className={styles.contentSlide}>
        <header>
          <CalendarDays />
          <p className={styles.eyebrow}>Le programme</p>
          <h2>Aujourd’hui chez Welcome!</h2>
        </header>
        <div className={styles.events}>
          {eventsData.events.map((event) => (
            <div className={styles.event} key={event.id}>
              <time>{event.start}</time>
              <span>{event.title}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    services: (
      <div className={styles.contentSlide}>
        <header>
          <Sparkles />
          <p className={styles.eyebrow}>À votre disposition</p>
          <h2>Les services Welcome!</h2>
        </header>
        <div className={styles.serviceGrid}>
          {services.map(({ icon: Icon, label }) => (
            <div className={styles.service} key={label}>
              <Icon />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    practical: (
      <div className={styles.practicalSlide}>
        <div>
          <Info />
          <p className={styles.eyebrow}>Informations pratiques</p>
          <h2>
            Tout ce qu’il vous faut,
            <br />
            au bon endroit.
          </h2>
          <p className={styles.lead}>
            Horaires, consignes et actualités pourront être partagés ici.
          </p>
        </div>
        <div className={styles.qrPlaceholder}>
          <QrCode />
          <strong>Informations membres</strong>
          <span>QR code à configurer</span>
        </div>
        <div className={styles.wifiCard}>
          <Wifi />
          <div>
            <small>Réseau Wi-Fi</small>
            <strong>Demandez vos accès à l’équipe</strong>
          </div>
        </div>
      </div>
    ),
    announcement: (
      <div className={styles.announcementSlide}>
        <MessageSquareText />
        <p className={styles.eyebrow}>{DISPLAY_ANNOUNCEMENT.eyebrow}</p>
        <h2>{DISPLAY_ANNOUNCEMENT.title}</h2>
        <p className={styles.lead}>{DISPLAY_ANNOUNCEMENT.body}</p>
        <span className={styles.announcementLabel}>{DISPLAY_ANNOUNCEMENT.label}</span>
      </div>
    ),
    branding: (
      <div className={styles.brandingSlide}>
        <Image
          src={heroImage}
          alt="Espace Welcome! Coworking à Strasbourg"
          fill
          sizes="100vw"
          quality={60}
          priority
          className={styles.brandingImage}
        />
        <div className={styles.brandingShade} />
        <Brand light={false} />
        <h2>
          Travaillez.
          <br />
          Échangez.
          <br />
          <em>Développez.</em>
        </h2>
      </div>
    ),
  };

  return (
    <main className={styles.screen}>
      {slides.map((slide, index) => (
        <section
          className={`${styles.slide} ${index === visibleIndex ? styles.active : ""}`}
          aria-hidden={index !== visibleIndex}
          key={slide.id}
        >
          {content[slide.id]}
        </section>
      ))}
      <div className={styles.progress} aria-hidden="true">
        {slides.map((slide, index) => (
          <span className={index === visibleIndex ? styles.progressActive : ""} key={slide.id} />
        ))}
      </div>
    </main>
  );
}
