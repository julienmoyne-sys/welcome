"use client";

import {
  Building2,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Map,
  Newspaper,
  Sun,
  Wind,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import websitePreview from "@/assets/hero-welcome-real.png";

import {
  DISPLAY_LIVE_REFRESH_MS,
  DISPLAY_REFRESH_MS,
  DISPLAY_SLIDES,
  DISPLAY_STATE_TICK_MS,
} from "./config";
import { getReservationState } from "./availability";
import styles from "./display.module.css";
import { TrafficMap } from "./TrafficMap";
import type { DisplayEventsResponse, DisplaySlideId, LiveInfoResponse } from "./types";

const EMPTY_LIVE_INFO: LiveInfoResponse = {
  updatedAt: "",
  weather: null,
  headlines: [],
  traffic: [],
};

function weatherLabel(code: number) {
  if (code === 0) return "Ciel dégagé";
  if (code <= 3) return "Partiellement nuageux";
  if (code <= 48) return "Brume ou brouillard";
  if (code <= 67) return "Pluie";
  if (code <= 77) return "Neige";
  if (code <= 82) return "Averses";
  if (code <= 86) return "Averses de neige";
  return "Orages";
}

function WeatherPictogram({ code }: { code: number }) {
  if (code === 0) return <Sun />;
  if (code <= 3) return <CloudSun />;
  if (code <= 48) return <CloudFog />;
  if (code <= 67 || (code >= 80 && code <= 82)) return <CloudRain />;
  if (code <= 86) return <CloudSnow />;
  if (code >= 95) return <CloudLightning />;
  return <Cloud />;
}

export function DisplayScreen({ initialEvents }: { initialEvents: DisplayEventsResponse }) {
  const [now, setNow] = useState<Date | null>(null);
  const [eventsData, setEventsData] = useState(initialEvents);
  const [liveInfo, setLiveInfo] = useState<LiveInfoResponse>(EMPTY_LIVE_INFO);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showLocalNews, setShowLocalNews] = useState(true);

  const slides = useMemo(() => DISPLAY_SLIDES.filter((slide) => slide.enabled), []);

  useEffect(() => {
    const initialClock = window.setTimeout(() => setNow(new Date()), 0);
    const clock = window.setInterval(() => setNow(new Date()), DISPLAY_STATE_TICK_MS);
    return () => {
      window.clearTimeout(initialClock);
      window.clearInterval(clock);
    };
  }, []);

  useEffect(() => {
    let controller: AbortController | null = null;
    const refresh = async () => {
      controller?.abort();
      const activeController = new AbortController();
      controller = activeController;
      try {
        const response = await fetch("/api/display/live", {
          cache: "no-store",
          signal: activeController.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const nextInfo = (await response.json()) as LiveInfoResponse;
        setLiveInfo(nextInfo);
      } catch (error) {
        if (!activeController.signal.aborted) {
          console.warn("Échec temporaire des informations en direct", {
            errorType: error instanceof Error ? error.name : "UnknownError",
          });
        }
      }
    };
    void refresh();
    const polling = window.setInterval(refresh, DISPLAY_LIVE_REFRESH_MS);
    return () => {
      window.clearInterval(polling);
      controller?.abort();
    };
  }, []);

  useEffect(() => {
    let activeController: AbortController | null = null;

    const refresh = async () => {
      activeController?.abort();
      const controller = new AbortController();
      activeController = controller;

      try {
        const response = await fetch("/api/display/events", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const nextEvents = (await response.json()) as DisplayEventsResponse;
        if (!Array.isArray(nextEvents.events) || !Array.isArray(nextEvents.reservations)) {
          throw new Error("Invalid display events response");
        }

        // Remplacement atomique : les modifications et suppressions Google remplacent l'ancien état.
        setEventsData(nextEvents);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.warn("Échec temporaire de la synchronisation Google Calendar", {
          errorType: error instanceof Error ? error.name : "UnknownError",
        });
      }
    };
    void refresh();
    const polling = window.setInterval(refresh, DISPLAY_REFRESH_MS);
    return () => {
      window.clearInterval(polling);
      activeController?.abort();
    };
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

  useEffect(() => {
    if (slides[visibleIndex]?.id !== "live") return;
    const alternation = window.setInterval(() => setShowLocalNews((local) => !local), 10_000);
    return () => window.clearInterval(alternation);
  }, [slides, visibleIndex]);

  const localHeadlines = liveInfo.headlines.filter((headline) => headline.scope === "local");
  const worldHeadlines = liveInfo.headlines.filter((headline) => headline.scope === "world");
  const displayedHeadlines = showLocalNews
    ? localHeadlines.length > 0
      ? localHeadlines
      : worldHeadlines
    : worldHeadlines.length > 0
      ? worldHeadlines
      : localHeadlines;
  const displayingLocalNews = displayedHeadlines[0]?.scope === "local";

  const time = now?.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) ?? "--:--";
  const date = now?.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const meetingReservations = eventsData.reservations.filter(
    ({ resource }) => resource === "meeting-room",
  );
  const roomState = getReservationState(meetingReservations, now ?? new Date(0));
  const dayReservations = roomState.ordered;

  const content: Record<DisplaySlideId, React.ReactNode> = {
    welcome: (
      <div className={styles.welcomeSlide}>
        <div className={styles.welcomeCopy}>
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
    availability: (
      <div className={styles.availabilitySlide}>
        <header className={styles.availabilityHeader}>
          <Building2 />
          <div>
            <p className={styles.eyebrow}>Disponibilité des espaces</p>
            <h2>Salle de réunion</h2>
          </div>
        </header>

        <div className={styles.availabilityBody}>
          <div className={styles.roomStatusCard}>
            <div
              className={`${styles.statusPill} ${roomState.current ? styles.statusBusy : styles.statusAvailable}`}
            >
              <span />
              {roomState.current
                ? "Réservée"
                : meetingReservations.length === 0
                  ? "Disponible aujourd’hui"
                  : "Disponible actuellement"}
            </div>

            {roomState.current ? (
              <div className={styles.currentReservation}>
                <p>{roomState.current.reservationTitle}</p>
                <strong>
                  {roomState.current.allDay
                    ? "Toute la journée"
                    : `${roomState.current.start} — ${roomState.current.end}`}
                </strong>
                <small>
                  {roomState.current.allDay
                    ? "Réservée pour la journée"
                    : `Disponible à partir de ${roomState.availableAt}`}
                </small>
              </div>
            ) : roomState.next ? (
              <div className={styles.nextReservation}>
                <small>Prochaine réservation</small>
                <p>{roomState.next.reservationTitle}</p>
                <strong>
                  {roomState.next.start} — {roomState.next.end}
                </strong>
              </div>
            ) : null}
          </div>

          {dayReservations.length > 0 && (
            <div className={styles.daySchedule}>
              <p className={styles.scheduleTitle}>Réservations du jour</p>
              <div className={styles.scheduleList}>
                {dayReservations.map((reservation) => {
                  const isCurrent = roomState.current?.id === reservation.id;
                  const isPast = new Date(reservation.endAt).getTime() <= (now?.getTime() ?? 0);
                  return (
                    <div
                      className={`${styles.scheduleItem} ${isCurrent ? styles.scheduleCurrent : ""} ${isPast ? styles.schedulePast : ""}`}
                      key={reservation.id}
                    >
                      <time>
                        {reservation.allDay
                          ? "Toute la journée"
                          : `${reservation.start} — ${reservation.end}`}
                      </time>
                      <strong>{reservation.reservationTitle}</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    website: (
      <div className={styles.websiteSlide}>
        <div className={styles.websiteCopy}>
          <p className={styles.eyebrow}>Nouveau</p>
          <h2>Notre nouveau site est en ligne.</h2>
        </div>

        <div
          className={styles.browserPreview}
          aria-label="Aperçu du nouveau site Welcome! Coworking"
        >
          <div className={styles.browserBar}>
            <div className={styles.browserDots} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className={styles.browserUrl}>www.welcome-coworking.com</div>
          </div>
          <div className={styles.browserContent}>
            <Image
              src={websitePreview}
              alt="Aperçu des espaces Welcome! Coworking"
              fill
              sizes="58vw"
              className={styles.websitePreviewImage}
            />
            <div className={styles.previewOverlay}>
              <span>WELCOME!</span>
              <strong>Le prolongement de votre chez vous.</strong>
              <small>Strasbourg · Meinau</small>
            </div>
          </div>
        </div>
      </div>
    ),
    live: (
      <div className={styles.liveSlide}>
        <header className={styles.liveHeader}>
          <div>
            <p className={styles.eyebrow}>Strasbourg en direct</p>
            <h2>L’essentiel, en un coup d’œil.</h2>
          </div>
          <span>{time}</span>
        </header>

        <div className={styles.liveGrid}>
          <section className={styles.weatherPanel}>
            <div className={styles.liveSectionTitle}>
              <CloudSun />
              <span>Météo locale</span>
            </div>
            {liveInfo.weather ? (
              <>
                <div className={styles.weatherVisual}>
                  <div className={styles.weatherPictogram} aria-hidden="true">
                    <WeatherPictogram code={liveInfo.weather.weatherCode} />
                  </div>
                  <strong className={styles.weatherTemperature}>
                    {Math.round(liveInfo.weather.temperature)}°
                  </strong>
                </div>
                <p className={styles.weatherCondition}>
                  {weatherLabel(liveInfo.weather.weatherCode)}
                </p>
                <div className={styles.weatherDetails}>
                  <span>
                    <Droplets />
                    {liveInfo.weather.humidity}%
                  </span>
                  <span>
                    <Wind />
                    {Math.round(liveInfo.weather.windSpeed)} km/h
                  </span>
                </div>
              </>
            ) : (
              <p className={styles.liveUnavailable}>Météo en cours de chargement…</p>
            )}
          </section>

          <section className={styles.newsPanel}>
            <div className={styles.liveSectionTitle}>
              <Newspaper />
              <span>{displayingLocalNews ? "À Strasbourg" : "Dans le monde"}</span>
            </div>
            <div className={styles.headlineList}>
              {displayedHeadlines.length > 0 ? (
                displayedHeadlines.slice(0, 3).map((headline, index) => (
                  <article key={`${headline.title}-${index}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <strong>{headline.title}</strong>
                      <small>{headline.source}</small>
                    </div>
                  </article>
                ))
              ) : (
                <p className={styles.liveUnavailable}>Actualités en cours de chargement…</p>
              )}
            </div>
          </section>

          <section className={styles.trafficPanel}>
            <div className={styles.liveSectionTitle}>
              <Map />
              <span>Grands axes</span>
            </div>
            <TrafficMap />
            <div className={styles.trafficLegend}>
              <span>
                <i className={styles.legendDense} />
                Dense
              </span>
              <span>
                <i className={styles.legendBlocked} />
                Saturé
              </span>
            </div>
            <small className={styles.trafficSource}>Source : TomTom Traffic</small>
          </section>
        </div>
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
