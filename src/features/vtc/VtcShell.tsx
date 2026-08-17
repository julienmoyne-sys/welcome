"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Clock3,
  ContactRound,
  Droplets,
  Eye,
  Flag,
  Gauge,
  Home,
  Languages,
  MapPin,
  Moon,
  Newspaper,
  RefreshCw,
  Route as RouteIcon,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Wind,
} from "lucide-react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useRef, useState } from "react";

import driverCardImage from "@/assets/vtc-card-driver.png";
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

import { SAFETY_ITEMS, VTC_MENU, type VtcSectionId } from "./content";
import styles from "./vtc.module.css";
import { EntertainmentScreen } from "./EntertainmentScreen";
import { DEMO_DRIVER_CONTENT, type DriverContent } from "@/lib/driver-content";

export const INACTIVITY_TIMEOUT_MS = process.env.NODE_ENV === "test" ? 250 : 2 * 60 * 1_000;
const SLEEP_STATE_KEY = "welcome-vtc-sleeping";
const LANGUAGE_STORAGE_KEY = "welcome-vtc-language";
type VtcLanguage = "FR" | "DE" | "EN" | "ES";
const VTC_CARD_IMAGES = {
  journey: journeyCardImage,
  live: liveCardImage,
  entertainment: entertainmentCardImage,
  services: servicesCardImage,
  region: regionCardImage,
  coworking: driverCardImage,
} as const;

type CockpitWeather = {
  temperature: number;
  weatherCode: number;
  pressure: number;
  europeanAqi: number;
};

type LiveDashboardData = {
  updatedAt: string;
  weather: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    weather_code: number;
    cloud_cover: number;
    surface_pressure: number;
    wind_speed_10m: number;
    wind_gusts_10m: number;
    wind_direction_10m: number;
    visibility: number;
    european_aqi: number | null;
    uv_index: number | null;
    sunrise: string | null;
    sunset: string | null;
  } | null;
  featuredImage: {
    url: string;
    width: number;
    height: number;
    title: string;
    author: string;
    license: string;
    licenseUrl: string | null;
    sourceUrl: string;
  } | null;
  headlines: Array<{
    title: string;
    link: string;
    publishedAt: string;
    source: string;
    tone: "news" | "light";
  }>;
};

function WeatherGlyph({ code }: { code: number | null }) {
  if (code === null) return <Thermometer aria-hidden="true" />;
  if (code === 0) return <Sun aria-hidden="true" />;
  if (code <= 2) return <CloudSun aria-hidden="true" />;
  if (code === 3) return <Cloud aria-hidden="true" />;
  if (code <= 48) return <CloudFog aria-hidden="true" />;
  if (code <= 67 || (code >= 80 && code <= 82)) return <CloudRain aria-hidden="true" />;
  if (code <= 77 || (code >= 85 && code <= 86)) return <CloudSnow aria-hidden="true" />;
  if (code >= 95) return <CloudLightning aria-hidden="true" />;
  return <Cloud aria-hidden="true" />;
}

function airQualityLabel(europeanAqi: number) {
  if (europeanAqi <= 20) return "Bonne";
  if (europeanAqi <= 40) return "Assez bonne";
  if (europeanAqi <= 60) return "Moyenne";
  if (europeanAqi <= 80) return "Médiocre";
  if (europeanAqi <= 100) return "Mauvaise";
  return "Très mauvaise";
}

function weatherLabel(code: number) {
  if (code === 0) return "Ciel dégagé";
  if (code <= 2) return "Partiellement nuageux";
  if (code === 3) return "Couvert";
  if (code <= 48) return "Brouillard";
  if (code <= 67 || (code >= 80 && code <= 82)) return "Pluie";
  if (code <= 77 || (code >= 85 && code <= 86)) return "Neige";
  return "Orages";
}

function shortTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(
    new Date(value),
  );
}

function formatServicePrice(priceCents: number | null, currency: string) {
  if (priceCents === null) return "Offert";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: priceCents % 100 === 0 ? 0 : 2,
  }).format(priceCents / 100);
}

function VtcLogo({ subdued = false }: { subdued?: boolean }) {
  return (
    <span className={`${styles.logoFrame} ${subdued ? styles.logoFrameSubdued : ""}`}>
      <Image src={welcomeLogo} alt="Welcome! VTC" priority className={styles.logo} />
    </span>
  );
}

function SectionHeader() {
  return (
    <header className={styles.sectionHeader}>
      <VtcLogo />
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
          <div className={styles.homeTitleRow}>
            <h1 id="vtc-welcome-title">Bienvenue à bord</h1>
            <time className={styles.clock}>{time}</time>
          </div>
          <p className={styles.tagline}>Votre trajet, en toute sérénité.</p>
        </div>
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
  const [weather, setWeather] = useState<CockpitWeather | null>(null);
  const [weatherLoadedContext, setWeatherLoadedContext] = useState<string | null>(null);
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
  const weatherLatitude = route?.destination.latitude ?? gps?.latitude;
  const weatherLongitude = route?.destination.longitude ?? gps?.longitude;
  const weatherContext =
    weatherLatitude === undefined || weatherLongitude === undefined
      ? null
      : `${route ? "destination" : "current"}:${weatherLatitude.toFixed(3)}:${weatherLongitude.toFixed(3)}`;
  const visibleWeather = weatherLoadedContext === weatherContext ? weather : null;
  const destinationSuffix = route ? " (à destination)" : "";
  const temperatureLabel = route ? "Température à destination" : "Température actuelle";

  useEffect(() => {
    if (!weatherContext || weatherLatitude === undefined || weatherLongitude === undefined) return;
    const controller = new AbortController();
    const params = new URLSearchParams({
      lat: String(weatherLatitude),
      lon: String(weatherLongitude),
    });
    void fetch(`/api/vtc/weather?${params}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: CockpitWeather) => {
        setWeather(data);
        setWeatherLoadedContext(weatherContext);
      })
      .catch((error: unknown) => {
        if ((error as Error)?.name !== "AbortError") {
          setWeather(null);
          setWeatherLoadedContext(weatherContext);
        }
      });
    return () => controller.abort();
  }, [weatherContext, weatherLatitude, weatherLongitude]);

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
            city: gps?.city,
          }),
          signal: controller.signal,
        })
      : fetch(
          `/api/vtc/nearby?${new URLSearchParams({
            lat: nearbyLatitude,
            lon: nearbyLongitude,
            ...(gps?.city ? { city: gps.city } : {}),
          })}`,
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
  }, [gps?.city, nearbyContext, nearbyLatitude, nearbyLongitude, route]);

  return (
    <div className={`${styles.detailBody} ${styles.cockpitBody}`}>
      <div className={styles.cockpitHeading}>
        <div className={styles.introBlock}>
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
            <div className={styles.cityConditions}>
              <span>Altitude {gps?.altitude == null ? "—" : `${Math.round(gps.altitude)} m`}</span>
              <span>
                <WeatherGlyph code={visibleWeather?.weatherCode ?? null} />
                <span>{temperatureLabel}</span>
                <strong>
                  {visibleWeather ? `${Math.round(visibleWeather.temperature)} °C` : "—"}
                </strong>
              </span>
            </div>
          </div>
        </section>

        <div className={styles.cockpitDials}>
          {[
            {
              label: `Pression${destinationSuffix}`,
              value: visibleWeather ? `${Math.round(visibleWeather.pressure)} hPa` : "—",
              icon: Gauge,
            },
            {
              label: `Qualité de l’air${destinationSuffix}`,
              value: visibleWeather ? airQualityLabel(visibleWeather.europeanAqi) : "—",
              icon: Wind,
            },
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
          <span className={styles.timelineLabel}>SITES À PROXIMITÉ</span>
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

function LiveScreen({ location }: { location: ReturnType<typeof useVtcLocation>["location"] }) {
  const [data, setData] = useState<LiveDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ lat: String(location.lat), lon: String(location.lon) });
    fetch(`/api/vtc/live?${params}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((payload: LiveDashboardData) => setData(payload))
      .catch((error: unknown) => {
        if ((error as Error)?.name !== "AbortError") setData(null);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [location.lat, location.lon, refreshKey]);

  useEffect(() => {
    const timer = window.setInterval(() => setRefreshKey((value) => value + 1), 5 * 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const current = data?.weather;
  const news = data?.headlines.filter((item) => item.tone === "news") ?? [];
  const light = data?.headlines.filter((item) => item.tone === "light") ?? [];
  const headlines = Array.from({ length: Math.max(news.length, light.length) }).flatMap(
    (_, index) =>
      [news[index], light[index]].filter((item): item is LiveDashboardData["headlines"][number] =>
        Boolean(item),
      ),
  );

  return (
    <div className={`${styles.detailBody} ${styles.liveDashboard}`}>
      <header className={styles.liveDashboardHeader}>
        <h2>Météo</h2>
        <div>
          <h2>Actualités</h2>
          <button type="button" onClick={() => setRefreshKey((value) => value + 1)}>
            <RefreshCw aria-hidden="true" /> Actualiser
          </button>
        </div>
      </header>

      <div className={styles.liveDashboardGrid}>
        <div className={styles.liveSideColumn}>
          <section className={styles.weatherDashboard} aria-label="Météo actuelle">
            {loading && !current ? (
              <div className={styles.liveLoading}>Actualisation de la météo…</div>
            ) : current ? (
              <>
                <div className={styles.weatherMain}>
                  <WeatherGlyph code={current.weather_code} />
                  <div>
                    <strong>{Math.round(current.temperature_2m)}°</strong>
                    <span>{weatherLabel(current.weather_code)}</span>
                    <small>Ressenti {Math.round(current.apparent_temperature)} °C</small>
                  </div>
                  <strong className={styles.weatherLocation}>{location.city}</strong>
                </div>
                <div className={styles.weatherMetrics}>
                  {[
                    {
                      icon: Droplets,
                      label: "Humidité",
                      value: `${current.relative_humidity_2m} %`,
                    },
                    {
                      icon: Wind,
                      label: "Vent",
                      value: `${Math.round(current.wind_speed_10m)} km/h`,
                    },
                    {
                      icon: Gauge,
                      label: "Pression",
                      value: `${Math.round(current.surface_pressure)} hPa`,
                    },
                    {
                      icon: CloudRain,
                      label: "Précipitations",
                      value: `${current.precipitation} mm`,
                    },
                    {
                      icon: Eye,
                      label: "Visibilité",
                      value: `${Math.round(current.visibility / 1000)} km`,
                    },
                    {
                      icon: Sun,
                      label: "Indice UV",
                      value: current.uv_index == null ? "—" : current.uv_index.toFixed(1),
                    },
                  ].map(({ icon: Icon, label, value }) => (
                    <article key={label}>
                      <Icon aria-hidden="true" />
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </article>
                  ))}
                </div>
                <div className={styles.weatherFooter}>
                  <span>
                    <Sunrise aria-hidden="true" /> Lever {shortTime(current.sunrise)}
                  </span>
                  <span>
                    <Sunset aria-hidden="true" /> Coucher {shortTime(current.sunset)}
                  </span>
                  <span>
                    Air {current.european_aqi == null ? "—" : airQualityLabel(current.european_aqi)}
                  </span>
                </div>
              </>
            ) : (
              <div className={styles.liveLoading}>Météo temporairement indisponible.</div>
            )}
          </section>

          {data?.featuredImage ? (
            <article className={styles.pictureOfDay}>
              <Image
                src={data.featuredImage.url}
                alt={data.featuredImage.title}
                fill
                sizes="(max-width: 900px) 100vw, 42vw"
              />
              <div className={styles.pictureOfDayShade} />
              <div className={styles.pictureOfDayCopy}>
                <span>Image du jour</span>
                <strong>{data.featuredImage.title}</strong>
                <small>
                  {data.featuredImage.author} · {data.featuredImage.license}
                </small>
                <a href={data.featuredImage.sourceUrl} target="_blank" rel="noreferrer">
                  Voir sur Wikimedia Commons
                </a>
              </div>
            </article>
          ) : null}
        </div>

        <section className={styles.newsDashboard} aria-label="Fil d’actualité">
          <div className={styles.newsHeading}>
            <div className={styles.newsHeadingTitle}>
              <div>
                <Newspaper aria-hidden="true" />
                <span>Le fil du moment</span>
              </div>
            </div>
            <small>France 24 + une pause insolite</small>
          </div>
          <div className={styles.newsFeed}>
            {headlines.length ? (
              headlines.map((item) => (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  key={`${item.source}-${item.title}`}
                  data-tone={item.tone}
                >
                  <span>{item.source}</span>
                  <strong>{item.title}</strong>
                  <small>
                    {item.publishedAt
                      ? new Intl.DateTimeFormat("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(item.publishedAt))
                      : "En direct"}
                  </small>
                </a>
              ))
            ) : (
              <div className={styles.liveLoading}>Actualités temporairement indisponibles.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ServicesScreen({ content }: { content: DriverContent }) {
  return (
    <div className={`${styles.detailBody} ${styles.servicesBody}`}>
      <div className={styles.introBlock}>
        <h2>Services à bord</h2>
      </div>
      <div className={styles.servicesColumns}>
        <section className={styles.driverServices} aria-label="Services proposés par le chauffeur">
          <div className={styles.driverSectionHeading}>
            <span>À votre disposition</span>
            <small>{content.driver.displayName}</small>
          </div>
          <div className={styles.driverServiceList}>
            {content.services.map((service, index) => (
              <article key={service.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{service.title}</strong>
                  <p>{service.description}</p>
                </div>
                <small className={styles.driverServicePrice}>
                  <span>Prix</span>
                  <strong>{formatServicePrice(service.priceCents, service.currency)}</strong>
                </small>
              </article>
            ))}
            {!content.services.length && (
              <p className={styles.driverContentEmpty}>Aucun service personnalisé renseigné.</p>
            )}
          </div>
        </section>
        <section className={styles.safetySection} aria-label="Consignes de sécurité">
          <div className={styles.driverSectionHeading}>
            <span>Consignes de sécurité à bord</span>
          </div>
          <div className={styles.safetyGrid}>
            {SAFETY_ITEMS.map(({ title, text, image }) => (
              <article className={styles.safetyCard} key={title}>
                <div className={styles.safetyPhoto}>
                  <Image src={image} alt="" fill sizes="(max-width: 900px) 100vw, 25vw" />
                </div>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  {title === "Ceinture" && (
                    <small>
                      Pour un passager majeur, l’éventuelle amende pour non-port de la ceinture est
                      à la charge du passager.
                    </small>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function DriverScreen({ content }: { content: DriverContent }) {
  const { driver } = content;

  return (
    <div className={`${styles.detailBody} ${styles.driverProfileBody}`}>
      <section className={styles.driverProfileHero} aria-labelledby="driver-profile-name">
        <div className={styles.driverAvatar} aria-hidden="true">
          {driver.firstName.slice(0, 1).toUpperCase()}
        </div>
        <p className={styles.eyebrow}>Votre chauffeur</p>
        <h2 id="driver-profile-name">{driver.firstName}</h2>
        <span className={styles.driverReference}>
          Chauffeur n° {String(driver.id).padStart(4, "0")}
        </span>
        <p className={styles.driverBio}>{driver.bio}</p>
        <div className={styles.driverVcardQr}>
          <div className={styles.driverQrCode} aria-label={`QR code vCard de ${driver.firstName}`}>
            <QRCodeSVG
              value={driver.vcard}
              size={132}
              level="M"
              bgColor="#ffffff"
              fgColor="#101412"
              marginSize={1}
            />
          </div>
          <span>
            <strong>Scannez pour garder le contact</strong>
            <small>La fiche de votre chauffeur s’ajoutera à votre téléphone</small>
          </span>
        </div>
      </section>

      <section className={styles.driverProfileDetails} aria-label="Présentation du chauffeur">
        {[
          {
            title: "Autres activités",
            values: driver.otherActivities,
            icon: BriefcaseBusiness,
          },
          { title: "Langues parlées", values: driver.languages, icon: Languages },
          { title: "Centres d’intérêt", values: driver.interests, icon: ContactRound },
        ].map(({ title, values, icon: Icon }) => (
          <article className={styles.driverDetailCard} key={title}>
            <div className={styles.driverDetailHeading}>
              <Icon aria-hidden="true" />
              <h3>{title}</h3>
            </div>
            <div className={styles.driverTags}>
              {values.length ? (
                values.map((value) => <span key={value}>{value}</span>)
              ) : (
                <span>Non renseigné</span>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export function VtcShell() {
  const [activeSection, setActiveSection] = useState<VtcSectionId | null>(null);
  const [time, setTime] = useState("--:--");
  const [isSleeping, setIsSleeping] = useState(false);
  const [language, setLanguage] = useState<VtcLanguage>("FR");
  const { location, isLocating } = useVtcLocation();
  const [driverContent, setDriverContent] = useState<DriverContent>(DEMO_DRIVER_CONTENT);
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
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (!savedLanguage || !["FR", "DE", "EN", "ES"].includes(savedLanguage)) return;
    window.queueMicrotask(() => setLanguage(savedLanguage as VtcLanguage));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const driverId = process.env.NEXT_PUBLIC_VTC_DRIVER_ID;
    const driverSlug = process.env.NEXT_PUBLIC_VTC_DRIVER_SLUG ?? "demo";
    const query = driverId
      ? `id=${encodeURIComponent(driverId)}`
      : `driver=${encodeURIComponent(driverSlug)}`;
    fetch(`/api/vtc/driver-content?${query}`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((content: DriverContent) => setDriverContent(content))
      .catch(() => undefined);
    return () => controller.abort();
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
          <SectionHeader />
          <div className={styles.detailViewport}>
            {activeSection === "journey" && <JourneyScreen />}
            {activeSection === "live" && <LiveScreen location={location} />}
            {activeSection === "entertainment" && <EntertainmentScreen />}
            {activeSection === "services" && <ServicesScreen content={driverContent} />}
            {activeSection === "region" && (
              <RegionScreen
                location={location}
                isLocating={isLocating}
                driverFavorites={driverContent.favorites}
                driverName={driverContent.driver.displayName}
              />
            )}
            {activeSection === "coworking" && <DriverScreen content={driverContent} />}
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
          <label className={styles.languageSelect}>
            <span className={styles.srOnly}>Langue</span>
            <select
              value={language}
              aria-label="Choisir la langue"
              onChange={(event) => {
                const nextLanguage = event.target.value as VtcLanguage;
                setLanguage(nextLanguage);
                window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
              }}
            >
              <option value="FR">FR</option>
              <option value="DE">DE</option>
              <option value="EN">EN</option>
              <option value="ES">ES</option>
            </select>
          </label>
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
