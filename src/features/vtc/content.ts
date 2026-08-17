import {
  Armchair,
  BatteryCharging,
  Baby,
  BriefcaseBusiness,
  Building2,
  CarFront,
  DoorOpen,
  Gamepad2,
  Headphones,
  MapPinned,
  Music2,
  Newspaper,
  Radio,
  Route,
  ShieldCheck,
  Snowflake,
  Sparkles,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type VtcSectionId =
  "journey" | "live" | "entertainment" | "region" | "services" | "coworking";

export type VtcMenuItem = {
  id: VtcSectionId;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
};

export const VTC_MENU: VtcMenuItem[] = [
  {
    id: "journey",
    title: "Cockpit",
    description: "Informations utiles",
    icon: Route,
    accent: "01",
  },
  {
    id: "live",
    title: "En direct",
    description: "Actualités et météo",
    icon: Radio,
    accent: "02",
  },
  {
    id: "entertainment",
    title: "Divertissements",
    description: "Musique, lecture et jeux à bord.",
    icon: Headphones,
    accent: "03",
  },
  {
    id: "region",
    title: "TOURISME",
    description: "Nos suggestions locales",
    icon: MapPinned,
    accent: "04",
  },
  {
    id: "services",
    title: "Services à bord",
    description: "Sécurité et confort",
    icon: Armchair,
    accent: "05",
  },
  {
    id: "coworking",
    title: "BUSINESS",
    description: "Espaces de travail",
    icon: BriefcaseBusiness,
    accent: "06",
  },
];

export const LIVE_ITEMS = [
  { title: "Trafic", icon: CarFront },
  { title: "Temps de trajet", icon: Route },
  { title: "Heure d’arrivée", icon: MapPinned },
] as const;

export const ENTERTAINMENT_ITEMS = [
  { title: "Musique", icon: Music2 },
  { title: "Presse", icon: Newspaper },
  { title: "Jeux", icon: Gamepad2 },
] as const;

export const SAFETY_ITEMS = [
  {
    title: "Ceinture",
    text: "Attachez votre ceinture dès votre installation et conservez-la pendant tout le trajet.",
    icon: ShieldCheck,
  },
  {
    title: "Portes",
    text: "Attendez l’arrêt complet et l’accord du chauffeur avant d’ouvrir une porte, côté trottoir si possible.",
    icon: DoorOpen,
  },
  {
    title: "Enfants",
    text: "Signalez avant le départ tout besoin de siège enfant afin qu’un dispositif adapté puisse être prévu.",
    icon: Baby,
  },
  {
    title: "Effets personnels",
    text: "Gardez les bagages hors des zones de passage et vérifiez vos effets personnels avant de descendre.",
    icon: WalletCards,
  },
] as const;

export const COWORKING_FEATURES = [
  "Espaces de travail premium",
  "Bureaux privatifs",
  "Coworking",
  "Salle de réunion",
  "Environnement professionnel",
  "Strasbourg",
] as const;

export const JOURNEY_FIELDS = [
  { label: "Destination", icon: MapPinned },
  { label: "Durée estimée", icon: Route },
  { label: "Heure d’arrivée", icon: CarFront },
  { label: "Trafic", icon: Building2 },
] as const;
