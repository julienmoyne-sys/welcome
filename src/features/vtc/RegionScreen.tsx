"use client";

import {
  CalendarDays,
  Compass,
  Heart,
  Info,
  Landmark,
  MapPin,
  Trophy,
  Utensils,
} from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useState } from "react";

import { getDepartmentTourismContent } from "@/data/departments";
import type { RegionalCard } from "@/data/regions";
import type { VtcLocation } from "@/lib/vtc-location";

import styles from "./vtc.module.css";

type RegionTab = "welcome" | "visit" | "food" | "activities" | "agenda" | "favorites" | "practical";
type EventCard = {
  id: string;
  title: string;
  description: string | null;
  city: string | null;
  distanceKm: number | null;
  startDate: string | null;
  startTime: string | null;
  category: string | null;
};

const TABS = [
  { id: "welcome", label: "Bienvenue dans le département", icon: Compass },
  { id: "visit", label: "Lieux à visiter", icon: Landmark },
  { id: "food", label: "Gastronomie", icon: Utensils },
  { id: "activities", label: "Activités", icon: Trophy },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "favorites", label: "Coups de cœur du chauffeur", icon: Heart },
  { id: "practical", label: "Pratique", icon: Info },
] as const;

function RegionalCards({ items, fallback }: { items: RegionalCard[]; fallback: StaticImageData }) {
  return (
    <div className={styles.regionCards}>
      {items.slice(0, 6).map((item) => (
        <article className={styles.regionCard} key={item.title}>
          <Image src={item.image ?? fallback} alt="" fill sizes="(max-width: 900px) 33vw, 24vw" />
          <span className={styles.regionCardShade} />
          <div>
            {item.category && <small>{item.category}</small>}
            <strong>{item.title}</strong>
            <p>{item.description}</p>
            {(item.location || item.distanceKm !== undefined) && (
              <span>
                <MapPin aria-hidden="true" />
                {item.location ?? `${item.distanceKm} km environ`}
              </span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function friendlyDate(date: string | null) {
  if (!date) return "Prochainement";
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  if (date === today) return "Aujourd’hui";
  if (date === tomorrow) return "Demain";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(
    new Date(`${date}T12:00:00`),
  );
}

function EventsPanel({ city, lat, lon }: { city: string; lat: number; lon: number }) {
  const [events, setEvents] = useState<EventCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/vtc/events?lat=${lat}&lon=${lon}&radius=30`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : { events: [] }))
      .then((data: { events?: EventCard[] }) => setEvents(data.events?.slice(0, 6) ?? []))
      .catch(() => undefined)
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [lat, lon]);

  return (
    <div className={styles.eventsPanel}>
      <div className={styles.regionPanelHeading}>
        <div>
          <p>À proximité</p>
          <h2>Que faire autour de vous ?</h2>
        </div>
        <span>Les événements des 7 prochains jours autour de {city}</span>
      </div>
      {loading ? (
        <div className={styles.eventSkeletons}>
          {Array.from({ length: 3 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>
      ) : events.length ? (
        <div className={styles.eventGrid}>
          {events.map((event) => (
            <article key={event.id}>
              <small>{event.category ?? "📍 À découvrir"}</small>
              <strong>{event.title}</strong>
              <p>{event.description ?? "Une sortie sélectionnée près de votre trajet."}</p>
              <span>
                {friendlyDate(event.startDate)}
                {event.startTime ? ` · ${event.startTime}` : ""}
              </span>
              <span>
                {event.city ?? city}
                {event.distanceKm !== null ? ` · ${event.distanceKm} km` : ""}
              </span>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.regionEmpty}>
          La sélection de sorties sera bientôt disponible autour de {city}.
        </div>
      )}
      <small className={styles.dataCredit}>Données touristiques : DATAtourisme</small>
    </div>
  );
}

export function RegionScreen({
  location,
  isLocating,
}: {
  location: VtcLocation;
  isLocating: boolean;
}) {
  const [activeTab, setActiveTab] = useState<RegionTab>("welcome");
  const content = getDepartmentTourismContent(location.departmentCode);
  const welcomeTitle = content?.welcomeTitle ?? `Bienvenue dans le ${location.department}`;
  const genericMessage = `Les suggestions pour ${location.department} seront bientôt disponibles.`;

  return (
    <div className={styles.regionLayout}>
      <nav className={styles.regionNav} aria-label="Rubriques régionales">
        <div className={styles.regionLocation}>
          <MapPin aria-hidden="true" />
          <div>
            <small>{isLocating ? "Localisation…" : "Vous êtes autour de"}</small>
            <strong>{location.city}</strong>
          </div>
        </div>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            data-active={activeTab === id}
            onClick={() => setActiveTab(id)}
          >
            <Icon aria-hidden="true" />
            <span>{id === "welcome" ? welcomeTitle : label}</span>
          </button>
        ))}
      </nav>

      <section className={styles.regionContent}>
        {activeTab === "welcome" && content && (
          <div className={styles.regionHero}>
            <Image src={content.heroImage} alt="" fill priority sizes="75vw" />
            <span className={styles.regionHeroShade} />
            <div className={styles.regionHeroCopy}>
              <p>Découverte départementale</p>
              <h2>{content.welcomeTitle}</h2>
              <span>{content.introduction}</span>
              <ul>
                {content.facts.slice(0, 4).map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
              <a
                className={styles.regionSource}
                href={content.introductionSourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Source : Wikipédia
              </a>
            </div>
          </div>
        )}
        {activeTab === "welcome" && !content && (
          <div className={styles.regionEmpty}>
            <h2>{welcomeTitle}</h2>
            <p>{genericMessage}</p>
          </div>
        )}
        {activeTab === "food" &&
          (content ? (
            <RegionalCards items={content.gastronomy} fallback={content.heroImage} />
          ) : (
            <div className={styles.regionEmpty}>{genericMessage}</div>
          ))}
        {activeTab === "visit" &&
          (content ? (
            <RegionalCards items={content.placesToVisit} fallback={content.heroImage} />
          ) : (
            <div className={styles.regionEmpty}>{genericMessage}</div>
          ))}
        {activeTab === "favorites" &&
          (content?.driverFavorites.length ? (
            <RegionalCards items={content.driverFavorites} fallback={content.heroImage} />
          ) : (
            <div className={styles.regionEmpty}>
              Les coups de cœur du chauffeur seront bientôt disponibles.
            </div>
          ))}
        {activeTab === "activities" &&
          (content ? (
            <RegionalCards items={content.activities} fallback={content.heroImage} />
          ) : (
            <div className={styles.regionEmpty}>{genericMessage}</div>
          ))}
        {activeTab === "agenda" && (
          <EventsPanel city={location.city} lat={location.lat} lon={location.lon} />
        )}
        {activeTab === "practical" && (
          <div className={styles.practicalPanel}>
            <div className={styles.regionPanelHeading}>
              <div>
                <p>Repères utiles</p>
                <h2>Pratique</h2>
              </div>
              <span>Autour de {location.city}</span>
            </div>
            <div className={styles.practicalGrid}>
              <article>
                <MapPin aria-hidden="true" />
                <small>Ville actuelle</small>
                <strong>{location.city}</strong>
              </article>
              <article>
                <Landmark aria-hidden="true" />
                <small>Territoire à découvrir</small>
                <strong>{location.department}</strong>
              </article>
              <article>
                <Info aria-hidden="true" />
                <small>Région administrative</small>
                <strong>{location.region}</strong>
              </article>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
