import {
  Armchair,
  BatteryCharging,
  BriefcaseBusiness,
  Building2,
  CarFront,
  Headphones,
  MapPinned,
  Radio,
  Route,
  Snowflake,
  Sparkles,
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
    description: "Musique, vidéos et jeux à bord",
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

import safetyBelongingsImage from "@/assets/vtc-safety-belongings.png";
import safetyChildrenImage from "@/assets/vtc-safety-children.png";
import safetyDoorsImage from "@/assets/vtc-safety-doors.png";
import safetySeatbeltImage from "@/assets/vtc-safety-seatbelt.png";

export const SAFETY_ITEMS = [
  {
    title: "Ceinture",
    text: "Attachez votre ceinture dès votre installation et conservez-la pendant tout le trajet.",
    image: safetySeatbeltImage,
  },
  {
    title: "Portes",
    text: "Attendez l’arrêt complet et l’accord du chauffeur avant d’ouvrir une porte, côté trottoir si possible.",
    image: safetyDoorsImage,
  },
  {
    title: "Enfants",
    text: "Signalez avant le départ tout besoin de siège enfant afin qu’un dispositif adapté puisse être prévu.",
    image: safetyChildrenImage,
  },
  {
    title: "Effets personnels",
    text: "Gardez les bagages hors des zones de passage et vérifiez vos effets personnels avant de descendre.",
    image: safetyBelongingsImage,
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
