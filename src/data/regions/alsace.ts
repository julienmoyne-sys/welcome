import cityImage from "@/assets/vtc-card-strasbourg.png";
import cultureImage from "@/assets/editorial-welcome-2026.png";
import foodImage from "@/assets/cuisine-detente-pro.png";
import landscapeImage from "@/assets/hero-welcome-real.png";
import sportImage from "@/assets/clients/RCSA.png";

import type { TourismRegion } from "./types";

export const alsace: TourismRegion = {
  id: "alsace",
  displayName: "L’Alsace",
  administrativeRegion: "Grand Est",
  cities: ["Strasbourg", "Colmar", "Mulhouse", "Sélestat", "Haguenau"],
  departments: ["Bas-Rhin", "Haut-Rhin"],
  heroImage: cityImage,
  introduction:
    "Entre villes de caractère, vignobles et Vosges, une région chaleureuse à découvrir.",
  facts: ["Capitale européenne", "Deux départements", "Vignoble de 170 km", "Massif des Vosges"],
  gastronomy: [
    {
      title: "Flammekueche",
      description: "Fine pâte, crème, oignons et lardons, cuite à feu vif.",
      image: foodImage,
    },
    {
      title: "Choucroute",
      description: "Le grand classique alsacien, généreux et convivial.",
      image: foodImage,
    },
    {
      title: "Spaetzle",
      description: "Petites pâtes fraîches, parfaites avec les plats mijotés.",
      image: foodImage,
    },
    {
      title: "Baeckeoffe",
      description: "Viandes et pommes de terre longuement mijotées.",
      image: foodImage,
    },
    {
      title: "Kougelhopf",
      description: "Brioche emblématique aux raisins et aux amandes.",
      image: foodImage,
    },
    {
      title: "Vins & crémants",
      description: "Riesling, gewurztraminer et bulles d’Alsace.",
      image: landscapeImage,
    },
  ],
  placesToVisit: [
    {
      title: "Strasbourg",
      description: "Cathédrale, Petite France et institutions européennes.",
      image: cityImage,
      distanceKm: 0,
    },
    {
      title: "Colmar",
      description: "Canaux, maisons colorées et musée Unterlinden.",
      image: cultureImage,
      distanceKm: 73,
    },
    {
      title: "Route des Vins",
      description: "Villages fleuris et domaines au pied des Vosges.",
      image: landscapeImage,
      distanceKm: 25,
    },
    {
      title: "Haut-Koenigsbourg",
      description: "Une forteresse spectaculaire dominant la plaine.",
      image: cultureImage,
      distanceKm: 62,
    },
    {
      title: "Mont Sainte-Odile",
      description: "Panorama et haut lieu spirituel alsacien.",
      image: landscapeImage,
      distanceKm: 44,
    },
    {
      title: "Villages alsaciens",
      description: "Obernai, Riquewihr et Kaysersberg au fil des façades.",
      image: cityImage,
      distanceKm: 29,
    },
  ],
  activities: [
    {
      title: "Balade sur l’Ill",
      category: "Navigation",
      description: "Découvrir Strasbourg au fil de l’eau et de ses quartiers historiques.",
      image: cityImage,
    },
    {
      title: "Vignoble à vélo",
      category: "Cyclotourisme",
      description: "Pédaler entre villages, domaines et paysages viticoles.",
      image: landscapeImage,
    },
    {
      title: "Randonnée vosgienne",
      category: "Plein air",
      description: "Sentiers, châteaux et panoramas sur la plaine d’Alsace.",
      image: landscapeImage,
    },
    {
      title: "Match à la Meinau",
      category: "Sport",
      description: "Vivre l’ambiance du Racing Club de Strasbourg Alsace.",
      image: sportImage,
    },
  ],
  driverFavorites: [
    {
      title: "Le réveil des quais",
      category: "Balade",
      description: "Les quais de l’Ill tôt le matin, quand la ville s’éveille.",
      image: cityImage,
      location: "Strasbourg",
    },
    {
      title: "Le vignoble depuis Andlau",
      category: "Point de vue",
      description: "Une échappée paisible entre vignes et contreforts vosgiens.",
      image: landscapeImage,
      location: "Andlau",
    },
    {
      title: "Obernai en fin de journée",
      category: "Village",
      description: "Une halte idéale quand les ruelles retrouvent leur calme.",
      image: cultureImage,
      location: "Obernai",
    },
  ],
  localSports: [
    {
      title: "Racing Club de Strasbourg Alsace",
      venue: "Stade de la Meinau",
      description: "Le club phare de Strasbourg et son public passionné.",
      image: sportImage,
      category: "Football",
    },
  ],
};
