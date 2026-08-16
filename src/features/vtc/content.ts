import {
  Armchair,
  BatteryCharging,
  Baby,
  BriefcaseBusiness,
  Building2,
  CarFront,
  DoorOpen,
  Landmark,
  MapPinned,
  Music2,
  Route,
  ShieldCheck,
  ShoppingBag,
  Snowflake,
  Sparkles,
  Theater,
  Utensils,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type VtcSectionId = "journey" | "safety" | "services" | "strasbourg" | "coworking";

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
    title: "Votre trajet",
    description: "Les informations utiles de votre parcours.",
    icon: Route,
    accent: "01",
  },
  {
    id: "safety",
    title: "Sécurité",
    description: "Les consignes essentielles à bord.",
    icon: ShieldCheck,
    accent: "02",
  },
  {
    id: "services",
    title: "Services à bord",
    description: "Votre confort pendant le trajet.",
    icon: Armchair,
    accent: "03",
  },
  {
    id: "strasbourg",
    title: "Découvrir Strasbourg",
    description: "Quelques pistes pour profiter de la ville.",
    icon: MapPinned,
    accent: "04",
  },
  {
    id: "coworking",
    title: "Welcome! Coworking",
    description: "Un lieu de travail premium à Strasbourg.",
    icon: BriefcaseBusiness,
    accent: "05",
  },
];

export const SAFETY_ITEMS = [
  {
    title: "Ceinture",
    text: "Pour votre sécurité, gardez votre ceinture attachée pendant le trajet.",
    icon: ShieldCheck,
  },
  {
    title: "Portes",
    text: "Attendez l’arrêt complet du véhicule avant d’ouvrir une porte.",
    icon: DoorOpen,
  },
  {
    title: "Enfants",
    text: "Les enfants doivent utiliser un dispositif de retenue adapté lorsque la réglementation l’exige.",
    icon: Baby,
  },
  {
    title: "Effets personnels",
    text: "Avant de quitter le véhicule, pensez à vérifier que vous n’avez rien oublié.",
    icon: WalletCards,
  },
] as const;

export const ONBOARD_SERVICES = [
  { title: "Recharge téléphone", icon: BatteryCharging, visible: true },
  { title: "Climatisation", icon: Snowflake, visible: true },
  { title: "Température à bord", icon: CarFront, visible: true },
  { title: "Musique", icon: Music2, visible: true },
  { title: "Informations pratiques", icon: Sparkles, visible: true },
] as const;

export const STRASBOURG_CATEGORIES = [
  { title: "À découvrir", icon: Landmark },
  { title: "Restaurants", icon: Utensils },
  { title: "Culture", icon: Theater },
  { title: "Shopping", icon: ShoppingBag },
  { title: "Sorties", icon: Sparkles },
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
