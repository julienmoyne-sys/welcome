"use client";

import { ArrowLeft, Home, Moon, QrCode } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import coworkingImage from "@/assets/hero-welcome-real.png";
import coworkingCardImage from "@/assets/vtc-card-coworking.png";
import entertainmentCardImage from "@/assets/vtc-card-entertainment.png";
import journeyCardImage from "@/assets/vtc-card-journey.png";
import liveCardImage from "@/assets/vtc-card-live.png";
import servicesCardImage from "@/assets/vtc-card-services.png";
import strasbourgCardImage from "@/assets/vtc-card-strasbourg.png";
import welcomeLogo from "@/assets/welcome-vtc-logo.png";

import {
  COWORKING_FEATURES,
  ENTERTAINMENT_ITEMS,
  JOURNEY_FIELDS,
  LIVE_ITEMS,
  ONBOARD_SERVICES,
  STRASBOURG_CATEGORIES,
  VTC_MENU,
  type VtcSectionId,
} from "./content";
import styles from "./vtc.module.css";

export const INACTIVITY_TIMEOUT_MS = process.env.NODE_ENV === "test" ? 250 : 2 * 60 * 1_000;
const VTC_CARD_IMAGES = {
  journey: journeyCardImage,
  live: liveCardImage,
  entertainment: entertainmentCardImage,
  services: servicesCardImage,
  alsace: strasbourgCardImage,
  coworking: coworkingCardImage,
} as const;

function VtcLogo({ subdued = false }: { subdued?: boolean }) {
  return (
    <span className={`${styles.logoFrame} ${subdued ? styles.logoFrameSubdued : ""}`}>
      <Image src={welcomeLogo} alt="Welcome! VTC" priority className={styles.logo} />
    </span>
  );
}

function SectionHeader({ title, onHome }: { title: string; onHome: () => void }) {
  return (
    <header className={styles.sectionHeader}>
      <button
        className={styles.backButton}
        type="button"
        onClick={onHome}
        aria-label="Retour à l’accueil"
      >
        <ArrowLeft aria-hidden="true" />
        <span>Accueil</span>
      </button>
      <VtcLogo />
      <p>{title}</p>
    </header>
  );
}

function VtcHome({ time, onOpen }: { time: string; onOpen: (id: VtcSectionId) => void }) {
  return (
    <section className={styles.homeScreen} aria-labelledby="vtc-welcome-title">
      <header className={styles.homeHeader}>
        <div>
          <VtcLogo />
          <h1 id="vtc-welcome-title">Bienvenue à bord</h1>
          <p className={styles.tagline}>Votre trajet, en toute sérénité.</p>
        </div>
        <time className={styles.clock}>{time}</time>
      </header>

      <nav className={styles.menuGrid} aria-label="Services passagers">
        {VTC_MENU.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={styles.menuCard}
              type="button"
              onClick={() => onOpen(item.id)}
            >
              <Image
                src={VTC_CARD_IMAGES[item.id]}
                alt=""
                fill
                sizes="(max-width: 900px) 50vw, 33vw"
                className={styles.cardImage}
              />
              <span className={styles.cardShade} aria-hidden="true" />
              <span className={styles.cardNumber}>{item.accent}</span>
              <Icon className={styles.cardIcon} aria-hidden="true" />
              <span className={styles.cardCopy}>
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>
              <span className={styles.cardArrow} aria-hidden="true">
                →
              </span>
            </button>
          );
        })}
      </nav>
    </section>
  );
}

function JourneyScreen() {
  return (
    <div className={styles.detailBody}>
      <div className={styles.introBlock}>
        <p className={styles.eyebrow}>Votre trajet</p>
        <h2>Informations sur votre trajet</h2>
        <p>Cette interface est prête à recevoir les données de course en temps réel.</p>
      </div>
      <div className={styles.infoGrid}>
        {JOURNEY_FIELDS.map(({ label, icon: Icon }) => (
          <article className={styles.infoCard} key={label}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
            <strong>À venir</strong>
          </article>
        ))}
      </div>
    </div>
  );
}

function LiveScreen() {
  return (
    <div className={styles.detailBody}>
      <div className={styles.introBlock}>
        <p className={styles.eyebrow}>En direct</p>
        <h2>Votre trajet en temps réel</h2>
        <p>Les informations de circulation seront actualisées tout au long de votre trajet.</p>
      </div>
      <div className={styles.serviceGrid}>
        {LIVE_ITEMS.map(({ title, icon: Icon }) => (
          <article className={styles.serviceCard} key={title}>
            <Icon aria-hidden="true" />
            <strong>{title}</strong>
            <small>Mise à jour en direct</small>
          </article>
        ))}
      </div>
    </div>
  );
}

function EntertainmentScreen() {
  return (
    <div className={styles.detailBody}>
      <div className={styles.introBlock}>
        <p className={styles.eyebrow}>Pendant le trajet</p>
        <h2>Divertissements</h2>
        <p>Profitez d’une sélection pensée pour rendre votre voyage encore plus agréable.</p>
      </div>
      <div className={styles.serviceGrid}>
        {ENTERTAINMENT_ITEMS.map(({ title, icon: Icon }) => (
          <article className={styles.serviceCard} key={title}>
            <Icon aria-hidden="true" />
            <strong>{title}</strong>
            <small>Sélection à venir</small>
          </article>
        ))}
      </div>
    </div>
  );
}

function ServicesScreen() {
  return (
    <div className={styles.detailBody}>
      <div className={styles.introBlock}>
        <p className={styles.eyebrow}>Votre confort</p>
        <h2>Services à bord</h2>
        <p>La disponibilité de chaque service est à confirmer auprès de votre chauffeur.</p>
      </div>
      <div className={styles.serviceGrid}>
        {ONBOARD_SERVICES.filter((service) => service.visible).map(({ title, icon: Icon }) => (
          <article className={styles.serviceCard} key={title}>
            <Icon aria-hidden="true" />
            <strong>{title}</strong>
            <small>Disponibilité à confirmer</small>
          </article>
        ))}
      </div>
    </div>
  );
}

function StrasbourgScreen() {
  return (
    <div className={styles.detailBody}>
      <div className={styles.introBlock}>
        <p className={styles.eyebrow}>Escapade régionale</p>
        <h2>Découvrir l’Alsace</h2>
        <p>Une sélection régionale pourra prochainement enrichir chacune de ces catégories.</p>
      </div>
      <div className={styles.categoryGrid}>
        {STRASBOURG_CATEGORIES.map(({ title, icon: Icon }) => (
          <article className={styles.categoryCard} key={title}>
            <Icon aria-hidden="true" />
            <strong>{title}</strong>
            <small>Sélection à venir</small>
          </article>
        ))}
      </div>
    </div>
  );
}

function CoworkingScreen() {
  return (
    <div className={`${styles.detailBody} ${styles.coworkingBody}`}>
      <div className={styles.coworkingVisual}>
        <Image
          src={coworkingImage}
          alt="Espace Welcome! Coworking à Strasbourg"
          fill
          sizes="55vw"
        />
        <div className={styles.visualShade} />
        <div className={styles.visualCopy}>
          <p className={styles.eyebrow}>Welcome! Coworking</p>
          <h2>Le prolongement de votre chez vous.</h2>
          <p>Un environnement professionnel chaleureux, pensé pour travailler autrement.</p>
        </div>
      </div>
      <div className={styles.coworkingAside}>
        <ul>
          {COWORKING_FEATURES.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
        <div className={styles.qrPlaceholder} aria-label="Emplacement réservé au futur QR code">
          <QrCode aria-hidden="true" />
          <div>
            <strong>Découvrir Welcome!</strong>
            <small>QR code bientôt disponible</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VtcShell() {
  const [activeSection, setActiveSection] = useState<VtcSectionId | null>(null);
  const [time, setTime] = useState("--:--");
  const [isSleeping, setIsSleeping] = useState(false);
  const inactivityTimer = useRef<number | null>(null);
  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimer.current !== null) {
      window.clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
  }, []);
  const goHome = useCallback(() => {
    clearInactivityTimer();
    setActiveSection(null);
    window.location.reload();
  }, [clearInactivityTimer]);
  const enterSleep = useCallback(() => {
    clearInactivityTimer();
    setActiveSection(null);
    setIsSleeping(true);
  }, [clearInactivityTimer]);
  const wake = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    const updateClock = () =>
      setTime(
        new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
      );
    updateClock();
    const clock = window.setInterval(updateClock, 30_000);
    return () => window.clearInterval(clock);
  }, []);

  useEffect(() => {
    const reset = () => {
      clearInactivityTimer();
      if (!isSleeping) {
        inactivityTimer.current = window.setTimeout(enterSleep, INACTIVITY_TIMEOUT_MS);
      }
    };
    const events: Array<keyof WindowEventMap> = ["pointerdown", "touchstart", "click", "keydown"];
    events.forEach((event) => window.addEventListener(event, reset, { passive: true }));
    reset();
    return () => {
      clearInactivityTimer();
      events.forEach((event) => window.removeEventListener(event, reset));
    };
  }, [clearInactivityTimer, enterSleep, isSleeping]);

  const title = VTC_MENU.find((item) => item.id === activeSection)?.title ?? "";

  return (
    <main className={styles.shell}>
      <div className={styles.ambientLight} aria-hidden="true" />
      {activeSection === null ? (
        <VtcHome time={time} onOpen={setActiveSection} />
      ) : (
        <section className={styles.detailScreen}>
          <SectionHeader title={title} onHome={goHome} />
          <div className={styles.detailViewport}>
            {activeSection === "journey" && <JourneyScreen />}
            {activeSection === "live" && <LiveScreen />}
            {activeSection === "entertainment" && <EntertainmentScreen />}
            {activeSection === "services" && <ServicesScreen />}
            {activeSection === "alsace" && <StrasbourgScreen />}
            {activeSection === "coworking" && <CoworkingScreen />}
          </div>
          <button
            className={styles.floatingHome}
            type="button"
            onClick={goHome}
            aria-label="Accueil"
          >
            <Home aria-hidden="true" />
          </button>
        </section>
      )}
      {!isSleeping && (
        <div className={styles.utilityControls}>
          <button className={styles.sleepButton} type="button" onClick={enterSleep}>
            <Moon aria-hidden="true" />
            <span>Veille</span>
          </button>
        </div>
      )}
      <button
        className={styles.sleepOverlay}
        data-active={isSleeping}
        type="button"
        tabIndex={isSleeping ? 0 : -1}
        aria-hidden={!isSleeping}
        aria-label="Réveiller Welcome VTC"
        onPointerDown={(event) => {
          if (!isSleeping) return;
          event.preventDefault();
          event.stopPropagation();
          wake();
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <span className={styles.sleepContent}>
          <VtcLogo subdued />
          <span>Touchez l’écran pour commencer</span>
        </span>
      </button>
    </main>
  );
}
