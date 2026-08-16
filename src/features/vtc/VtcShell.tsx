"use client";

import {
  ArrowLeft,
  ArrowRight,
  CloudSun,
  Clock3,
  Compass,
  Gauge,
  Home,
  MapPin,
  Moon,
  Navigation,
  QrCode,
  Thermometer,
  Wind,
} from "lucide-react";
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

import { VtcLiveMap, type GpsSnapshot, type NavigationRoute } from "./VtcLiveMap";

import {
  COWORKING_FEATURES,
  ENTERTAINMENT_ITEMS,
  LIVE_ITEMS,
  ONBOARD_SERVICES,
  STRASBOURG_CATEGORIES,
  VTC_MENU,
  type VtcSectionId,
} from "./content";
import styles from "./vtc.module.css";

export const INACTIVITY_TIMEOUT_MS = process.env.NODE_ENV === "test" ? 250 : 2 * 60 * 1_000;
const SLEEP_STATE_KEY = "welcome-vtc-sleeping";
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
              <span className={styles.cardTextGroup}>
                <Icon className={styles.cardIcon} aria-hidden="true" />
                <span className={styles.cardCopy}>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>
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
  const [destinationInput, setDestinationInput] = useState("");
  const [gps, setGps] = useState<GpsSnapshot | null>(null);
  const [route, setRoute] = useState<NavigationRoute | null>(null);
  const [navigationStatus, setNavigationStatus] = useState<"idle" | "loading" | "error">("idle");
  const [navigationError, setNavigationError] = useState("");
  const updateGps = useCallback((snapshot: GpsSnapshot) => setGps(snapshot), []);
  const remainingTime = route
    ? route.durationSeconds < 3600
      ? `${Math.max(1, Math.round(route.durationSeconds / 60))} min`
      : `${Math.floor(route.durationSeconds / 3600)} h ${Math.round(
          (route.durationSeconds % 3600) / 60,
        )} min`
    : "—";

  return (
    <div className={`${styles.detailBody} ${styles.cockpitBody}`}>
      <div className={styles.cockpitHeading}>
        <div className={styles.introBlock}>
          <p className={styles.eyebrow}>Navigation</p>
          <h2>Cockpit</h2>
        </div>
        <div className={styles.destinationEntry}>
          <span className={styles.destinationHint} data-hidden={Boolean(route)} aria-hidden="true">
            <ArrowRight />
          </span>
          <form
            className={styles.destinationForm}
            onSubmit={async (event) => {
              event.preventDefault();
              if (!gps || !destinationInput.trim()) return;
              setNavigationStatus("loading");
              setNavigationError("");
              try {
                const params = new URLSearchParams({
                  q: destinationInput.trim(),
                  lat: String(gps.latitude),
                  lon: String(gps.longitude),
                });
                const response = await fetch(`/api/vtc/navigation?${params}`);
                const data = (await response.json()) as NavigationRoute & { error?: string };
                if (!response.ok) throw new Error(data.error ?? "Impossible de calculer le trajet");
                setRoute(data);
                setDestinationInput(data.destination.label);
                setNavigationStatus("idle");
              } catch (error) {
                setRoute(null);
                setNavigationStatus("error");
                setNavigationError(
                  error instanceof Error ? error.message : "Impossible de calculer le trajet",
                );
              }
            }}
          >
            <input
              type="text"
              value={destinationInput}
              onChange={(event) => setDestinationInput(event.target.value)}
              placeholder="Adresse de destination"
              aria-label="Adresse de destination"
            />
            <button
              type="submit"
              disabled={!destinationInput.trim() || !gps || navigationStatus === "loading"}
            >
              {navigationStatus === "loading" ? "Recherche…" : "Tracer"}
            </button>
            {navigationStatus === "error" && (
              <small className={styles.navigationError}>{navigationError}</small>
            )}
          </form>
        </div>
      </div>
      <div className={styles.cockpitGrid}>
        <section className={styles.altitudePanel} aria-label="Altitude et profil du parcours">
          <div className={styles.locationLine}>
            <MapPin aria-hidden="true" />
            <span>
              {gps?.city ??
                (gps
                  ? `${gps.latitude.toFixed(4)}, ${gps.longitude.toFixed(4)}`
                  : "GPS en attente")}
            </span>
          </div>
          <div className={styles.altitudeValue}>
            <span>Altitude actuelle</span>
            <strong>{gps?.altitude == null ? "—" : Math.round(gps.altitude)}</strong>
            <small>m</small>
          </div>
          <svg
            className={styles.elevationChart}
            viewBox="0 0 620 100"
            role="img"
            aria-label="Profil d’altitude de démonstration sur les 30 prochains kilomètres"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="elevation-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4bf63" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#d4bf63" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 72 C55 68 72 54 118 59 S184 78 235 61 S315 31 364 43 S420 67 468 54 S548 25 620 35 L620 100 L0 100 Z"
              fill="url(#elevation-fill)"
            />
            <path
              d="M0 72 C55 68 72 54 118 59 S184 78 235 61 S315 31 364 43 S420 67 468 54 S548 25 620 35"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>
          <div className={styles.chartLegend}>
            <span>Maintenant</span>
            <span>+30 km · 218 m</span>
          </div>
        </section>

        <div className={styles.cockpitDials}>
          {[
            { label: "Température", value: "18 °C", icon: Thermometer },
            { label: "Pression", value: "1 016 hPa", icon: Gauge },
            { label: "Cap", value: "Nord-Est", icon: Compass },
            { label: "Météo", value: "Éclaircies", icon: CloudSun },
          ].map(({ label, value, icon: Icon }) => (
            <article className={styles.cockpitDial} key={label}>
              <Icon aria-hidden="true" />
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </div>
      </div>

      <div className={styles.cockpitFacts}>
        {[
          {
            label: "Vitesse GPS",
            value: gps?.speed == null ? "—" : `${Math.round(gps.speed * 3.6)} km/h`,
            icon: Gauge,
          },
          { label: "Ville proche", value: "Obernai · 18 km", icon: Navigation },
          { label: "Qualité de l’air", value: "Bonne", icon: Wind },
          { label: "Temps restant", value: remainingTime, icon: Clock3 },
        ].map(({ label, value, icon: Icon }) => (
          <article key={label}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <VtcLiveMap route={route} onPosition={updateGps} />

      <section className={styles.routeTimeline} aria-label="Prochaines villes du parcours">
        <span className={styles.timelineLabel}>Sur votre route</span>
        <div className={styles.timelineTrack}>
          <span className={styles.timelineProgress} />
          {[
            ["Strasbourg", "maintenant"],
            ["Obernai", "18 km"],
            ["Sélestat", "48 km"],
            ["Colmar", "72 km"],
          ].map(([city, distance], index) => (
            <div className={styles.timelineStop} data-current={index === 0} key={city}>
              <span className={styles.timelineDot} />
              <strong>{city}</strong>
              <small>{distance}</small>
            </div>
          ))}
        </div>
      </section>
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
    window.sessionStorage.setItem(SLEEP_STATE_KEY, "1");
  }, [clearInactivityTimer]);
  const wake = useCallback(() => {
    window.sessionStorage.removeItem(SLEEP_STATE_KEY);
    window.location.reload();
  }, []);

  useEffect(() => {
    if (window.sessionStorage.getItem(SLEEP_STATE_KEY) !== "1") return;
    let active = true;
    window.queueMicrotask(() => {
      if (!active) return;
      setActiveSection(null);
      setIsSleeping(true);
    });
    return () => {
      active = false;
    };
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
