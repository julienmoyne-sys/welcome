import Image from "next/image";

import logo from "../assets/welcome-logo-cropped.png";

export function WelcomeLogo({ className }: { className?: string }) {
  return (
    <Image
      src={logo}
      alt="Welcome Coworking"
      className={`welcome-logo ${className ?? ""}`}
      width={210}
      height={41}
      style={{ objectFit: "contain", objectPosition: "left center" }}
      // Logo de l'en-tête, présent au-dessus de la ligne de flottaison sur
      // chaque page : à charger sans attendre l'observation du viewport.
      priority
    />
  );
}
