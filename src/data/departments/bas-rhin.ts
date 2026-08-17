import cultureImage from "@/assets/editorial-welcome-2026.png";
import fortificationsActivityImage from "@/assets/vtc-activity-67-fortifications.webp";
import marchesNoelActivityImage from "@/assets/vtc-activity-67-marches-noel.webp";
import randonneeVosgesActivityImage from "@/assets/vtc-activity-67-randonnee-vosges.webp";
import strasbourgBateauActivityImage from "@/assets/vtc-activity-67-strasbourg-bateau.webp";
import vignobleVeloActivityImage from "@/assets/vtc-activity-67-vignoble-velo.webp";
import visiteCaveActivityImage from "@/assets/vtc-activity-67-visite-cave.webp";
import cityImage from "@/assets/vtc-card-strasbourg.png";
import baeckeoffeImage from "@/assets/vtc-food-67-baeckeoffe.webp";
import bredeleImage from "@/assets/vtc-food-67-bredele.webp";
import choucrouteImage from "@/assets/vtc-food-67-choucroute.webp";
import flammekuecheImage from "@/assets/vtc-food-67-flammekueche.webp";
import kougelhopfImage from "@/assets/vtc-food-67-kougelhopf.webp";
import vinsAlsaceImage from "@/assets/vtc-food-67-vins-alsace.webp";
import fleckensteinImage from "@/assets/vtc-place-67-fleckenstein.webp";
import hautKoenigsbourgImage from "@/assets/vtc-place-67-haut-koenigsbourg.webp";
import montSainteOdileImage from "@/assets/vtc-place-67-mont-sainte-odile.webp";
import obernaiImage from "@/assets/vtc-place-67-obernai.webp";
import routeVinsImage from "@/assets/vtc-place-67-route-vins.webp";
import strasbourgImage from "@/assets/vtc-place-67-strasbourg.webp";

import type { DepartmentTourismContent } from "./types";

export const basRhin: DepartmentTourismContent = {
  code: "67",
  name: "Bas-Rhin",
  welcomeTitle: "Bienvenue dans le Bas-Rhin",
  introduction:
    "Autour de Strasbourg, le Bas-Rhin réunit patrimoine européen, villages alsaciens, vignoble et premiers reliefs des Vosges.",
  introductionSourceUrl: "https://fr.wikipedia.org/wiki/Bas-Rhin",
  heroImage: cityImage,
  facts: [
    "Préfecture : Strasbourg",
    "Au cœur de l’Alsace",
    "Vignoble et Vosges",
    "Frontière allemande",
  ],
  placesToVisit: [
    {
      title: "Strasbourg",
      description: "Cathédrale, Petite France et quartier européen.",
      image: strasbourgImage,
    },
    {
      title: "Château du Haut-Koenigsbourg",
      description: "La forteresse emblématique dominant la plaine d’Alsace.",
      image: hautKoenigsbourgImage,
    },
    {
      title: "Mont Sainte-Odile",
      description: "Un haut lieu spirituel ouvert sur un vaste panorama.",
      image: montSainteOdileImage,
    },
    {
      title: "Obernai",
      description: "Remparts, maisons à colombages et atmosphère alsacienne.",
      image: obernaiImage,
    },
    {
      title: "Château de Fleckenstein",
      description: "Une spectaculaire forteresse de grès dans les Vosges du Nord.",
      image: fleckensteinImage,
    },
    {
      title: "Route des Vins",
      description: "Vignobles, caves et villages entre Strasbourg et le Haut-Rhin.",
      image: routeVinsImage,
    },
  ],
  gastronomy: [
    {
      title: "Flammekueche",
      description: "Fine pâte garnie de crème, d’oignons et de lardons.",
      image: flammekuecheImage,
    },
    {
      title: "Choucroute garnie",
      description: "Chou fermenté, charcuteries et pommes de terre.",
      image: choucrouteImage,
    },
    {
      title: "Baeckeoffe",
      description: "Viandes marinées et pommes de terre longuement mijotées.",
      image: baeckeoffeImage,
    },
    {
      title: "Kougelhopf",
      description: "Brioche aux raisins et aux amandes, sucrée ou salée.",
      image: kougelhopfImage,
    },
    {
      title: "Bredele",
      description: "Petits biscuits alsaciens aux formes et parfums variés.",
      image: bredeleImage,
    },
    {
      title: "Vins d’Alsace",
      description: "Riesling, gewurztraminer, pinot gris et crémant d’Alsace.",
      image: vinsAlsaceImage,
    },
  ],
  activities: [
    {
      title: "Strasbourg en bateau",
      category: "Navigation",
      description: "Parcourir l’Ill autour du centre historique et du quartier européen.",
      image: strasbourgBateauActivityImage,
    },
    {
      title: "Vignoble à vélo",
      category: "Cyclotourisme",
      description: "Relier villages et domaines sur les itinéraires viticoles.",
      image: vignobleVeloActivityImage,
    },
    {
      title: "Randonnée vosgienne",
      category: "Plein air",
      description: "Marcher entre forêts, châteaux et panoramas gréseux.",
      image: randonneeVosgesActivityImage,
    },
    {
      title: "Visite de cave",
      category: "Terroir",
      description: "Découvrir les cépages alsaciens auprès des vignerons.",
      image: visiteCaveActivityImage,
    },
    {
      title: "Mémoire & fortifications",
      category: "Histoire",
      description: "Explorer châteaux forts et ouvrages de la ligne Maginot.",
      image: fortificationsActivityImage,
    },
    {
      title: "Marchés de Noël",
      category: "Tradition",
      description: "Profiter des lumières et savoir-faire locaux en hiver.",
      image: marchesNoelActivityImage,
    },
  ],
  driverFavorites: [
    {
      title: "Le réveil des quais",
      category: "Balade",
      description: "Les quais de l’Ill tôt le matin, quand Strasbourg s’éveille.",
      image: cityImage,
      location: "Strasbourg",
    },
    {
      title: "Le vignoble depuis Andlau",
      category: "Point de vue",
      description: "Une échappée paisible entre vignes et contreforts vosgiens.",
      image: cityImage,
      location: "Andlau",
    },
    {
      title: "Obernai en fin de journée",
      category: "Village",
      description: "Une halte idéale lorsque les ruelles retrouvent leur calme.",
      image: cultureImage,
      location: "Obernai",
    },
  ],
};
