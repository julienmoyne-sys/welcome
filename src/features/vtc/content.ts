import {
  Armchair,
  BatteryCharging,
  Building2,
  CarFront,
  Headphones,
  MapPinned,
  Radio,
  Route,
  Snowflake,
  Sparkles,
  UserRound,
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
    description: "Informations trajet",
    icon: Route,
    accent: "01",
  },
  {
    id: "live",
    title: "En direct",
    description: "Actu, sport et météo",
    icon: Radio,
    accent: "02",
  },
    {
    id: "services",
    title: "Services à bord",
    description: "Sécurité et confort",
    icon: Armchair,
    accent: "05",
  },
   {
    id: "region",
    title: "TOURISME",
    description: "Suggestions locales",
    icon: MapPinned,
    accent: "04",
  },
 {
    id: "entertainment",
    title: "détente",
    description: "Vidéo et jeux",
    icon: Headphones,
    accent: "03",
  },
  {
    id: "coworking",
    title: "VOTRE CHAUFFEUR",
    description: "Restons en contact",
    icon: UserRound,
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

export const JOURNEY_FIELDS = [
  { label: "Destination", icon: MapPinned },
  { label: "Durée estimée", icon: Route },
  { label: "Heure d’arrivée", icon: CarFront },
  { label: "Trafic", icon: Building2 },
] as const;
