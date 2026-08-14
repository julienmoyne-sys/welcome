"use client";

import Image from "next/image";
import { Building2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import logo from "@/assets/welcome-logo.png";

import { DISPLAY_REFRESH_MS, DISPLAY_SLIDES } from "./config";
import { getReservationState } from "./availability";
import styles from "./display.module.css";
import type { DisplayEventsResponse, DisplaySlideId } from "./types";

function Brand() {
  return (
    <span className={styles.lineLogoPanel}>
      <Image
        src={logo}
        alt="Welcome! Coworking"
        fill
        sizes="240px"
        className={styles.lineLogoImage}
        priority
      />
    </span>
  );
}

export function DisplayScreen({ initialEvents }: { initialEvents: DisplayEventsResponse }) {
  const [now, setNow] = useState<Date | null>(null);
  const [eventsData, setEventsData] = useState(initialEvents);
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = useMemo(() => DISPLAY_SLIDES.filter((slide) => slide.enabled), []);

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
  const meetingReservations = eventsData.reservations.filter(
    ({ resource }) => resource === "meeting-room",
  );
  const roomState = getReservationState(meetingReservations, now ?? new Date(0));
  const remainingReservations = roomState.ordered.filter(
    (reservation) => new Date(reservation.endAt).getTime() > (now?.getTime() ?? 0),
  );

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

          {remainingReservations.length > 0 && (
            <div className={styles.daySchedule}>
              <p className={styles.scheduleTitle}>Réservations restantes aujourd’hui</p>
              <div className={styles.scheduleList}>
                {remainingReservations.map((reservation) => {
                  const isCurrent = roomState.current?.id === reservation.id;
                  return (
                    <div
                      className={`${styles.scheduleItem} ${isCurrent ? styles.scheduleCurrent : ""}`}
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
