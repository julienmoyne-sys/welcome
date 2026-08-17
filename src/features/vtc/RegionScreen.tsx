"use client";

import {
  BadgeEuro,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CarFront,
  Cigarette,
  Clock3,
  Compass,
  Heart,
  Info,
  Landmark,
  Languages,
  MapPin,
  PhoneCall,
  PlugZap,
  Ruler,
  Star,
  Trophy,
  Utensils,
  Wifi,
} from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useMemo, useState } from "react";

import { getDepartmentTourismContent } from "@/data/departments";
import type { RegionalCard } from "@/data/regions";
import type { VtcLocation } from "@/lib/vtc-location";
import type { DriverFavorite } from "@/lib/driver-content";

import styles from "./vtc.module.css";

type RegionTab =
  "welcome" | "visit" | "food" | "activities" | "agenda" | "business" | "favorites" | "practical";
type EventCard = {
  id: string;
  title: string;
  description: string | null;
  city: string | null;
  distanceKm: number | null;
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  category: string;
  sourceUrl: string | null;
};

type EventPeriod = "all" | "today" | "tomorrow";
type EventsResponse = {
  events?: EventCard[];
  categories?: string[];
  status?: "ready" | "not-configured" | "upstream-error" | "invalid-request";
  scope?: "department" | "region";
};
type CoworkingSpace = {
  id: string;
  name: string;
  address: string | null;
  distanceKm: number;
  website: string | null;
  featured: boolean;
  rating: number | null;
};

const EXCHANGE_CURRENCIES = ["USD", "GBP", "CHF", "JPY", "CAD", "AUD", "CNY", "KRW"] as const;

function ExchangeRateCard() {
  const [currency, setCurrency] = useState<(typeof EXCHANGE_CURRENCIES)[number]>("USD");
  const [rate, setRate] = useState<number>();
  const [rateDate, setRateDate] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/vtc/exchange-rate?currency=${currency}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data: { status?: string; rate?: number; date?: string }) => {
        setRate(data.status === "ready" ? data.rate : undefined);
        setRateDate(data.status === "ready" ? data.date : undefined);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [currency]);

  return (
    <article>
      <BadgeEuro aria-hidden="true" />
      <small>Monnaie · Currency</small>
      <strong>Euro · EUR · €</strong>
      <div className={styles.exchangeRate}>
        <span>
          {rate ? `1 EUR = ${rate.toLocaleString("fr-FR")} ${currency}` : "Taux indisponible"}
        </span>
        <select
          aria-label="Devise de conversion"
          value={currency}
          onChange={(event) =>
            setCurrency(event.target.value as (typeof EXCHANGE_CURRENCIES)[number])
          }
        >
          {EXCHANGE_CURRENCIES.map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <p>
        Taux de référence BCE
        {rateDate
          ? ` du ${new Intl.DateTimeFormat("fr-FR").format(new Date(`${rateDate}T12:00:00`))}`
          : ""}
        .
      </p>
    </article>
  );
}

const TABS = [
  { id: "welcome", label: "Bienvenue dans le département", icon: Compass },
  { id: "visit", label: "Lieux à visiter", icon: Landmark },
  { id: "food", label: "Gastronomie", icon: Utensils },
  { id: "activities", label: "Activités", icon: Trophy },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "business", label: "Business", icon: BriefcaseBusiness },
  { id: "favorites", label: "Coups de cœur du chauffeur", icon: Heart },
  { id: "practical", label: "Pratique", icon: Info },
] as const;

function BusinessPanel({ city, lat, lon }: { city: string; lat: number; lon: number }) {
  const [spaces, setSpaces] = useState<CoworkingSpace[]>([]);
  const [nearestCity, setNearestCity] = useState(city);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ city, lat: String(lat), lon: String(lon) });
    fetch(`/api/vtc/coworking?${params}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data: { city?: string; spaces?: CoworkingSpace[] }) => {
        setNearestCity(data.city || city);
        setSpaces(data.spaces ?? []);
      })
      .catch((error: unknown) => {
        if ((error as Error).name !== "AbortError") setSpaces([]);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [city, lat, lon]);

  return (
    <div className={styles.businessPanel}>
      <div className={styles.regionPanelHeading}>
        <div>
          <p>Travailler autrement</p>
          <h2>Espaces de coworking</h2>
        </div>
        <span>Sélection autour de la grande ville la plus proche : {nearestCity}</span>
      </div>
      {loading ? (
        <div className={styles.eventSkeletons}>
          {Array.from({ length: 6 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>
      ) : spaces.length ? (
        <div className={styles.coworkingGrid}>
          {spaces.map((space) => (
            <article key={space.id} data-featured={space.featured}>
              <Building2 aria-hidden="true" />
              {space.featured && <small>Adresse partenaire à Strasbourg</small>}
              <strong>{space.name}</strong>
              {space.address && <p>{space.address}</p>}
              <span>
                <MapPin aria-hidden="true" /> {space.distanceKm} km
              </span>
              {space.rating !== null && (
                <span className={styles.coworkingRating}>
                  <Star aria-hidden="true" /> {space.rating.toLocaleString("fr-FR")}/5
                </span>
              )}
              {space.featured && space.website && (
                <a href={space.website} data-modal="true" aria-label={`Découvrir ${space.name}`}>
                  Découvrir l’espace
                </a>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.regionEmpty}>
          Aucun espace de coworking référencé autour de {nearestCity}.
        </div>
      )}
      <small className={styles.dataCredit}>Données géographiques : OpenStreetMap</small>
    </div>
  );
}

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

function parisDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function friendlyDate(date: string | null) {
  if (!date) return "Prochainement";
  const today = parisDate();
  const tomorrow = parisDate(1);
  if (date === today) return "Aujourd’hui";
  if (date === tomorrow) return "Demain";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(
    new Date(`${date}T12:00:00`),
  );
}

function EventsPanel({
  city,
  department,
  region,
  lat,
  lon,
}: {
  city: string;
  department: string;
  region: string;
  lat: number;
  lon: number;
}) {
  const [events, setEvents] = useState<EventCard[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<EventsResponse["status"]>();
  const [scope, setScope] = useState<EventsResponse["scope"]>();
  const [period, setPeriod] = useState<EventPeriod>("all");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      radius: "100",
      department,
      region,
    });
    fetch(`/api/vtc/events?${params}`, { signal: controller.signal })
      .then((response) => response.json() as Promise<EventsResponse>)
      .then((data) => {
        setEvents(data.events ?? []);
        setCategories(data.categories ?? []);
        setStatus(data.status);
        setScope(data.scope);
      })
      .catch((error: unknown) => {
        if ((error as Error).name !== "AbortError") setStatus("upstream-error");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [department, lat, lon, region]);

  const filteredEvents = useMemo(() => {
    const today = parisDate();
    const tomorrow = parisDate(1);
    return events.filter(
      (event) =>
        (category === "all" || event.category === category) &&
        (period === "all" ||
          (period === "today" &&
            event.startDate <= today &&
            (!event.endDate || event.endDate >= today)) ||
          (period === "tomorrow" &&
            event.startDate <= tomorrow &&
            (!event.endDate || event.endDate >= tomorrow))),
    );
  }, [category, events, period]);

  return (
    <div className={styles.eventsPanel}>
      <div className={styles.regionPanelHeading}>
        <div>
          <p>À proximité</p>
          <h2>Que faire autour de vous ?</h2>
        </div>
        <span>Les événements des 7 prochains jours à moins de 100 km de {city}</span>
      </div>
      {!loading && events.length > 0 && (
        <div className={styles.eventFilters} aria-label="Filtres de l’agenda">
          <div>
            {(
              [
                ["all", "7 jours"],
                ["today", "Aujourd’hui"],
                ["tomorrow", "Demain"],
              ] as const
            ).map(([value, label]) => (
              <button
                type="button"
                key={value}
                data-active={period === value}
                onClick={() => setPeriod(value)}
              >
                {label}
              </button>
            ))}
          </div>
          {categories.length > 1 && (
            <label>
              <span>Catégorie</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="all">Toutes</option>
                {categories.map((item) => (
                  <option value={item} key={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}
      {loading ? (
        <div className={styles.eventSkeletons}>
          {Array.from({ length: 3 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>
      ) : filteredEvents.length ? (
        <div className={styles.eventGrid}>
          {filteredEvents.map((event) => (
            <article key={event.id}>
              {event.category.trim().toLocaleLowerCase("fr") !== "sortie" && (
                <small>{event.category}</small>
              )}
              <strong title={event.title}>{event.title}</strong>
              <p title={event.description ?? undefined}>
                {event.description ?? "Une sortie sélectionnée près de votre trajet."}
              </p>
              <span>
                {friendlyDate(event.startDate)}
                {event.startTime ? ` · ${event.startTime}` : ""}
              </span>
              <span>
                {event.city ?? city}
                {event.distanceKm !== null ? ` · ${event.distanceKm} km` : ""}
              </span>
              {event.sourceUrl && (
                <a href={event.sourceUrl} target="_blank" rel="noreferrer">
                  Voir l’événement
                </a>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.regionEmpty}>
          {status === "not-configured"
            ? "Le flux OpenAgenda doit être configuré pour afficher les sorties."
            : events.length
              ? "Aucun événement ne correspond à ces filtres."
              : `Aucun événement publié dans les 7 prochains jours à moins de 100 km de ${city}.`}
        </div>
      )}
      <small className={styles.dataCredit}>
        Événements réels et actualisés : OpenAgenda ·{" "}
        {scope === "region" ? `couverture régionale ${region}` : `couverture ${department}`}
      </small>
    </div>
  );
}

export function RegionScreen({
  location,
  isLocating,
  driverFavorites,
  driverName,
}: {
  location: VtcLocation;
  isLocating: boolean;
  driverFavorites: DriverFavorite[];
  driverName: string;
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
        {activeTab === "favorites" && (
          <div className={styles.driverFavoritesPanel}>
            <div className={styles.driverSectionHeading}>
              <span>Les adresses personnelles du chauffeur</span>
              <small>{driverName}</small>
            </div>
            <div className={styles.driverFavoritesGrid}>
              {driverFavorites.map((favorite, index) => (
                <article key={favorite.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <small className={styles.driverFavoriteLabel}>Adresse recommandée</small>
                    <strong>{favorite.title}</strong>
                    <p>{favorite.description}</p>
                    {favorite.address && (
                      <a
                        className={styles.driverFavoriteAddress}
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(favorite.address)}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Afficher ${favorite.address} dans Google Maps`}
                      >
                        <MapPin aria-hidden="true" /> {favorite.address}
                      </a>
                    )}
                  </div>
                </article>
              ))}
              {!driverFavorites.length && (
                <div className={styles.regionEmpty}>
                  Les coups de cœur du chauffeur seront bientôt disponibles.
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === "activities" &&
          (content ? (
            <RegionalCards items={content.activities} fallback={content.heroImage} />
          ) : (
            <div className={styles.regionEmpty}>{genericMessage}</div>
          ))}
        {activeTab === "agenda" && (
          <EventsPanel
            city={location.city}
            department={location.department}
            region={location.region}
            lat={location.lat}
            lon={location.lon}
          />
        )}
        {activeTab === "business" && (
          <BusinessPanel city={location.city} lat={location.lat} lon={location.lon} />
        )}
        {activeTab === "practical" && (
          <div className={styles.practicalPanel}>
            <div className={styles.regionPanelHeading}>
              <div>
                <p>Travel essentials</p>
                <h2>Bienvenue en France</h2>
              </div>
              <span>Informations essentielles pour les visiteurs internationaux</span>
            </div>
            <div className={styles.practicalGrid}>
              <article>
                <PhoneCall aria-hidden="true" />
                <small>Urgences · Emergency</small>
                <strong>112</strong>
                <p>Appel gratuit pour ambulance, police ou pompiers, depuis tout téléphone.</p>
              </article>
              <article>
                <Languages aria-hidden="true" />
                <small>Langue · Language</small>
                <strong>Français</strong>
                <p>Bonjour, s’il vous plaît et merci sont toujours appréciés.</p>
              </article>
              <ExchangeRateCard />
              <article>
                <PlugZap aria-hidden="true" />
                <small>Électricité · Power</small>
                <strong>230 V · 50 Hz</strong>
                <p>Prises de type E. Un adaptateur peut être nécessaire selon votre pays.</p>
              </article>
              <article>
                <Clock3 aria-hidden="true" />
                <small>Heure · Time zone</small>
                <strong>Europe/Paris</strong>
                <p>UTC+1 en hiver et UTC+2 en été. Le format 24 heures est habituel.</p>
              </article>
              <article>
                <Wifi aria-hidden="true" />
                <small>Téléphone · Mobile</small>
                <strong>+33 · indicatif France</strong>
                <p>
                  Depuis l’étranger, retirez le premier 0. Dans l’UE, l’itinérance est généralement
                  incluse.
                </p>
              </article>
              <article>
                <Ruler aria-hidden="true" />
                <small>Mesures · Units</small>
                <strong>Système métrique</strong>
                <p>
                  Distances en kilomètres, températures en degrés Celsius et carburant au litre.
                </p>
              </article>
              <article>
                <CarFront aria-hidden="true" />
                <small>Conduite · Driving</small>
                <strong>Roulez à droite</strong>
                <p>
                  Drive on the right and overtake on the left. Distances et vitesses sont en km.
                </p>
              </article>
              <article>
                <Cigarette aria-hidden="true" />
                <small>Tabac & alcool</small>
                <strong>Alcool : 18 ans minimum</strong>
                <p>
                  Il est interdit de fumer dans les lieux publics fermés et couverts. La vente ou
                  l’offre d’alcool est interdite aux moins de 18 ans.
                </p>
              </article>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
