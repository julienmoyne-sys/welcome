import ligneMaginotActivityImage from "@/assets/vtc-activity-57-ligne-maginot.webp";
import metzPiedActivityImage from "@/assets/vtc-activity-57-metz-pied.webp";
import moselleVeloActivityImage from "@/assets/vtc-activity-57-moselle-velo.webp";
import patrimoineVerrierActivityImage from "@/assets/vtc-activity-57-patrimoine-verrier.webp";
import randonneeBitcheActivityImage from "@/assets/vtc-activity-57-randonnee-bitche.webp";
import thermalismeAmnevilleActivityImage from "@/assets/vtc-activity-57-thermalisme-amneville.webp";
import moselleImage from "@/assets/vtc-department-57.webp";
import fuseauLorrainImage from "@/assets/vtc-food-57-fuseau-lorrain.webp";
import macaronsBoulayImage from "@/assets/vtc-food-57-macarons-boulay.webp";
import mirabelleImage from "@/assets/vtc-food-57-mirabelle.webp";
import pateLorrainImage from "@/assets/vtc-food-57-pate-lorrain.webp";
import quicheLorraineImage from "@/assets/vtc-food-57-quiche-lorraine.webp";
import vinsMoselleImage from "@/assets/vtc-food-57-vins-moselle.webp";
import arzvillerImage from "@/assets/vtc-place-57-arzviller.webp";
import bitcheImage from "@/assets/vtc-place-57-bitche.webp";
import maginotImage from "@/assets/vtc-place-57-maginot.webp";
import malbrouckImage from "@/assets/vtc-place-57-malbrock.webp";
import metzImage from "@/assets/vtc-place-57-metz.webp";
import sainteCroixImage from "@/assets/vtc-place-57-sainte-croix.webp";

import type { DepartmentTourismContent } from "./types";

export const moselle: DepartmentTourismContent = {
  code: "57",
  name: "Moselle",
  welcomeTitle: "Bienvenue en Moselle",
  introduction:
    "Terre de frontières au caractère franco-germanique, la Moselle mêle Metz, grands espaces, patrimoine militaire, verrier et industriel.",
  introductionSourceUrl: "https://fr.wikipedia.org/wiki/Moselle_(département)",
  heroImage: moselleImage,
  facts: [
    "Préfecture : Metz",
    "Région Grand Est",
    "Trois frontières proches",
    "Forêts et pays des étangs",
  ],
  placesToVisit: [
    {
      title: "Metz",
      description: "Cathédrale Saint-Étienne, vieille ville et Centre Pompidou-Metz.",
      image: metzImage,
    },
    {
      title: "Citadelle de Bitche",
      description: "Une forteresse monumentale au cœur du pays de Bitche.",
      image: bitcheImage,
    },
    {
      title: "Château de Malbrouck",
      description: "Un château médiéval restauré dominant la vallée de la Manderen.",
      image: malbrouckImage,
    },
    {
      title: "Parc animalier de Sainte-Croix",
      description: "Faune européenne et grands espaces naturels à Rhodes.",
      image: sainteCroixImage,
    },
    {
      title: "Plan incliné de Saint-Louis-Arzviller",
      description: "Un ascenseur à bateaux unique sur le canal de la Marne au Rhin.",
      image: arzvillerImage,
    },
    {
      title: "Ligne Maginot",
      description: "Simserhof et Hackenberg racontent l’histoire fortifiée du territoire.",
      image: maginotImage,
    },
  ],
  gastronomy: [
    {
      title: "Quiche lorraine",
      description: "L’incontournable tarte salée aux œufs, à la crème et aux lardons.",
      image: quicheLorraineImage,
    },
    {
      title: "Pâté lorrain",
      description: "Viandes marinées enveloppées dans une pâte feuilletée.",
      image: pateLorrainImage,
    },
    {
      title: "Fuseau lorrain",
      description: "Une charcuterie fumée emblématique du terroir lorrain.",
      image: fuseauLorrainImage,
    },
    {
      title: "Macarons de Boulay",
      description: "Des macarons moelleux aux amandes, spécialité mosellane.",
      image: macaronsBoulayImage,
    },
    {
      title: "Mirabelle de Lorraine",
      description: "Fruit doré décliné en tarte, confiture et eau-de-vie.",
      image: mirabelleImage,
    },
    {
      title: "Vins de Moselle AOC",
      description: "Des vins frais issus notamment de l’auxerrois et du pinot gris.",
      image: vinsMoselleImage,
    },
  ],
  activities: [
    {
      title: "Metz à pied",
      category: "Patrimoine",
      description: "Explorer la cathédrale, les places et l’architecture impériale.",
      image: metzPiedActivityImage,
    },
    {
      title: "Thermalisme à Amnéville",
      category: "Bien-être",
      description: "Profiter des équipements thermaux et de loisirs.",
      image: thermalismeAmnevilleActivityImage,
    },
    {
      title: "Randonnée au pays de Bitche",
      category: "Plein air",
      description: "Parcourir forêts, rochers de grès et étangs.",
      image: randonneeBitcheActivityImage,
    },
    {
      title: "Mémoire de la ligne Maginot",
      category: "Histoire",
      description: "Visiter les grands ouvrages fortifiés mosellans.",
      image: ligneMaginotActivityImage,
    },
    {
      title: "Patrimoine verrier",
      category: "Savoir-faire",
      description: "Découvrir Meisenthal et Saint-Louis-lès-Bitche.",
      image: patrimoineVerrierActivityImage,
    },
    {
      title: "Moselle à vélo",
      category: "Cyclotourisme",
      description: "Suivre les voies cyclables le long de la rivière et des canaux.",
      image: moselleVeloActivityImage,
    },
  ],
  driverFavorites: [],
};
