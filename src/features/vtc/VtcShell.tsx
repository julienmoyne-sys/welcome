"use client";

import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Flag,
  Gauge,
  Home,
  MapPin,
  Moon,
  QrCode,
  RefreshCw,
  Route as RouteIcon,
  Thermometer,
  Wind,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import coworkingImage from "@/assets/hero-welcome-real.png";
import coworkingCardImage from "@/assets/vtc-card-coworking.png";
import entertainmentCardImage from "@/assets/vtc-card-entertainment.png";
import journeyCardImage from "@/assets/vtc-card-cockpit.png";
import liveCardImage from "@/assets/vtc-card-news-weather.png";
import servicesCardImage from "@/assets/vtc-card-services.png";
import regionCardImage from "@/assets/vtc-card-strasbourg.png";
import welcomeLogo from "@/assets/welcome-vtc-logo.png";
import { DEPARTMENT_CARD_IMAGES } from "@/data/regions/department-images";

import {
  VtcLiveMap,
  type GpsSnapshot,
  type LocationStatus,
  type NavigationRoute,
} from "./VtcLiveMap";

import { RegionScreen } from "./RegionScreen";
import { useVtcLocation } from "./useVtcLocation";

import {
  COWORKING_FEATURES,
  ENTERTAINMENT_ITEMS,
  LIVE_ITEMS,
  ONBOARD_SERVICES,
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
  region: regionCardImage,
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

function VtcHome({
  time,
  onOpen,
  tourismImage,
}: {
  time: string;
  onOpen: (id: VtcSectionId) => void;
  tourismImage: (typeof VTC_CARD_IMAGES)[VtcSectionId] | string;
}) {
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
                src={item.id === "region" ? tourismImage : VTC_CARD_IMAGES[item.id]}
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
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("loading");
  const [route, setRoute] = useState<NavigationRoute | null>(null);
  const [arrivalTime, setArrivalTime] = useState<string | null>(null);
  const [navigationStatus, setNavigationStatus] = useState<"idle" | "loading" | "error">("idle");
  const [navigationError, setNavigationError] = useState("");
  const [cityPhotoFailedFor, setCityPhotoFailedFor] = useState<string | null>(null);
  const [nearbyPoints, setNearbyPoints] = useState<
    Array<{ id: string; name: string; category: string; distanceMeters: number }>
  >([]);
  const [nearbyLoadedContext, setNearbyLoadedContext] = useState<string | null>(null);
  const updateGps = useCallback((snapshot: GpsSnapshot) => setGps(snapshot), []);
  const updateLocationStatus = useCallback(
    (status: LocationStatus) => setLocationStatus(status),
    [],
  );
  const locationPlaceholder =
    locationStatus === "denied"
      ? "Localisation refusée"
      : locationStatus === "unavailable"
        ? "Position indisponible"
        : "Localisation en attente";
  const nearbyLatitude = gps?.latitude.toFixed(3);
  const nearbyLongitude = gps?.longitude.toFixed(3);
  const nearbyContext = route
    ? `route:${route.destination.latitude.toFixed(3)}:${route.destination.longitude.toFixed(3)}`
    : nearbyLatitude && nearbyLongitude
      ? `local:${nearbyLatitude}:${nearbyLongitude}`
      : null;
  const visibleNearbyPoints = nearbyLoadedContext === nearbyContext ? nearbyPoints : [];
  const remainingTime = route
    ? route.durationSeconds < 3600
      ? `${Math.max(1, Math.round(route.durationSeconds / 60))} min`
      : `${Math.floor(route.durationSeconds / 3600)} h ${Math.round(
          (route.durationSeconds % 3600) / 60,
        )} min`
    : "—";
  const remainingDistance = route
    ? route.distanceMeters < 1000
      ? `${Math.round(route.distanceMeters)} m`
      : `${(route.distanceMeters / 1000).toFixed(1).replace(".", ",")} km`
    : "—";
  const estimatedArrival = arrivalTime ?? "—";

  useEffect(() => {
    if (!nearbyLatitude || !nearbyLongitude) return;
    const controller = new AbortController();
    const request = route
      ? fetch("/api/vtc/nearby", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: Number(nearbyLatitude),
            longitude: Number(nearbyLongitude),
            route: route.geometry,
          }),
          signal: controller.signal,
        })
      : fetch(
          `/api/vtc/nearby?${new URLSearchParams({ lat: nearbyLatitude, lon: nearbyLongitude })}`,
          { signal: controller.signal },
        );
    void request
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { points?: typeof nearbyPoints }) => {
        setNearbyPoints(data.points ?? []);
        setNearbyLoadedContext(nearbyContext);
      })
      .catch((error: unknown) => {
        if ((error as Error)?.name !== "AbortError") {
          setNearbyPoints([]);
          setNearbyLoadedContext(nearbyContext);
        }
      });
    return () => controller.abort();
  }, [nearbyContext, nearbyLatitude, nearbyLongitude, route]);

  return (
    <div className={`${styles.detailBody} ${styles.cockpitBody}`}>
      <div className={styles.cockpitHeading}>
        <div className={styles.introBlock}>
          <p className={styles.eyebrow}>Navigation</p>
          <h2>COCKPIT</h2>
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
                setArrivalTime(
                  new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(
                    new Date(Date.now() + data.durationSeconds * 1000),
                  ),
                );
                setDestinationInput(data.destination.label);
                setNavigationStatus("idle");
              } catch (error) {
                setRoute(null);
                setArrivalTime(null);
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
          <Image
            src={
              gps?.city && cityPhotoFailedFor !== gps.city
                ? `/api/vtc/city-image?city=${encodeURIComponent(gps.city)}`
                : journeyCardImage
            }
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            className={styles.cityImage}
            unoptimized={Boolean(gps?.city && cityPhotoFailedFor !== gps.city)}
            onError={() => setCityPhotoFailedFor(gps?.city ?? null)}
          />
          <span className={styles.cityImageShade} aria-hidden="true" />
          <div className={styles.cityCurrentContent}>
            <span className={styles.locationLine}>
              <MapPin aria-hidden="true" />
              Ville actuelle
            </span>
            <strong>
              {gps?.city ??
                (gps
                  ? `${gps.latitude.toFixed(4)}, ${gps.longitude.toFixed(4)}`
                  : locationPlaceholder)}
            </strong>
            <small>Altitude {gps?.altitude == null ? "—" : `${Math.round(gps.altitude)} m`}</small>
          </div>
        </section>

        <div className={styles.cockpitDials}>
          {[
            { label: "Température", value: "18 °C", icon: Thermometer },
            { label: "Pression", value: "1 016 hPa", icon: Gauge },
            { label: "Qualité de l’air", value: "Bonne", icon: Wind },
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
          { label: "Temps restant", value: remainingTime, icon: Clock3 },
          { label: "Distance restante", value: remainingDistance, icon: RouteIcon },
          { label: "Arrivée estimée", value: estimatedArrival, icon: Flag },
        ].map(({ label, value, icon: Icon }) => (
          <article key={label}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <VtcLiveMap route={route} onPosition={updateGps} onStatusChange={updateLocationStatus} />

      {gps && (
        <section className={styles.routeTimeline} aria-label="Points d’intérêt à proximité">
          <span className={styles.timelineLabel}>
            {route ? "Sur votre trajet · rayon de 30 km" : "À proximité"}
          </span>
          <div className={styles.timelineTrack}>
            {nearbyLoadedContext !== nearbyContext ? (
              <span className={styles.poiEmpty}>Recherche des lieux d’intérêt…</span>
            ) : visibleNearbyPoints.length === 0 ? (
              <span className={styles.poiEmpty}>Aucun lieu d’intérêt trouvé.</span>
            ) : (
              visibleNearbyPoints.map((point) => (
                <div className={styles.timelineStop} key={point.id}>
                  <span className={styles.timelineDot} />
                  <strong title={point.name}>{point.name}</strong>
                  <small>
                    {point.category} ·{" "}
                    {point.distanceMeters < 1000
                      ? `${point.distanceMeters} m`
                      : `${(point.distanceMeters / 1000).toFixed(1).replace(".", ",")} km`}
                  </small>
                </div>
              ))
            )}
          </div>
        </section>
      )}
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
  const { location, isLocating } = useVtcLocation();
  const inactivityTimer = useRef<number | null>(null);
  const sleepStartedAt = useRef(0);
  const wakePointerStarted = useRef(false);
  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimer.current !== null) {
      window.clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
  }, []);
  const goHome = useCallback(() => {
    setActiveSection(null);
  }, []);
  const enterSleep = useCallback(() => {
    clearInactivityTimer();
    sleepStartedAt.current = Date.now();
    wakePointerStarted.current = false;
    setActiveSection(null);
    setIsSleeping(true);
    window.sessionStorage.setItem(SLEEP_STATE_KEY, "1");
  }, [clearInactivityTimer]);
  const wake = useCallback(() => {
    window.sessionStorage.removeItem(SLEEP_STATE_KEY);
    setActiveSection(null);
    setIsSleeping(false);
  }, []);

  useEffect(() => {
    if (window.sessionStorage.getItem(SLEEP_STATE_KEY) !== "1") return;
    sleepStartedAt.current = Date.now();
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
  const tourismImage =
    DEPARTMENT_CARD_IMAGES[location.departmentCode] ??
    (location.source === "device"
      ? `/api/vtc/city-image?city=${encodeURIComponent(location.city)}`
      : regionCardImage);

  return (
    <main className={styles.shell}>
      <div className={styles.ambientLight} aria-hidden="true" />
      {activeSection === null ? (
        <VtcHome time={time} onOpen={setActiveSection} tourismImage={tourismImage} />
      ) : (
        <section className={styles.detailScreen}>
          <SectionHeader title={title} onHome={goHome} />
          <div className={styles.detailViewport}>
            {activeSection === "journey" && <JourneyScreen />}
            {activeSection === "live" && <LiveScreen />}
            {activeSection === "entertainment" && <EntertainmentScreen />}
            {activeSection === "services" && <ServicesScreen />}
            {activeSection === "region" && (
              <RegionScreen location={location} isLocating={isLocating} />
            )}
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
      {!isSleeping && (
        <button
          className={styles.manualRefresh}
          type="button"
          onClick={() => window.location.reload()}
          aria-label="Rafraîchir l’interface"
          title="Rafraîchir"
        >
          <RefreshCw aria-hidden="true" />
        </button>
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
          if (Date.now() - sleepStartedAt.current >= 1500) wakePointerStarted.current = true;
        }}
        onPointerUp={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!isSleeping || !wakePointerStarted.current) return;
          wakePointerStarted.current = false;
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
