"use client";

import { useEffect, useRef } from "react";

const ELFSIGHT_APP_ID = "267687de-c0a9-4c6c-994c-99c838954b2b";
const PLATFORM_SRC = "https://static.elfsight.com/platform/platform.js";

// Déclenche le chargement 400 px avant l'entrée dans le viewport : le widget a le
// temps d'arriver sans que l'utilisateur voie un emplacement vide.
const PRELOAD_MARGIN = "400px";

// Le widget se construit en plusieurs passes ; au-delà, plus rien ne bouge.
const CAPTION_WATCH_MS = 15_000;

/**
 * La plateforme Elfsight enregistre des variables globales et scanne le document :
 * elle ne doit être insérée qu'une seule fois par page, et ne peut pas être
 * déchargée — d'où la recherche du script existant plutôt qu'un drapeau local.
 */
function loadElfsightPlatform() {
  if (document.querySelector(`script[src="${PLATFORM_SRC}"]`)) return;
  const script = document.createElement("script");
  script.src = PLATFORM_SRC;
  script.async = true;
  document.body.appendChild(script);
}

/** Le widget insère une citation d'auteur non souhaitée dans son en-tête. */
function removeUnwantedCaption(root: HTMLElement) {
  for (const caption of root.querySelectorAll('[class*="WidgetTitle__Caption"]')) {
    if (caption.textContent?.toLowerCase().includes("yamamoto")) caption.remove();
  }
}

/**
 * Avis Google via Elfsight.
 *
 * Script tiers volontairement chargé à l'approche de la section, et non à
 * l'hydratation : il ne pèse donc ni sur le TBT ni sur l'INP du chargement
 * initial, alors qu'il est situé en bas de la page d'accueil.
 */
export function GoogleReviews() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Pas de state ici : l'activation est un effet de bord sur le DOM, elle ne
  // change rien au rendu React. Passer par un setState provoquerait un rendu en
  // cascade inutile (et l'avertissement react-hooks/set-state-in-effect).
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    let captionWatcher: MutationObserver | undefined;
    let stopWatching: number | undefined;

    const activate = () => {
      loadElfsightPlatform();

      // Observation limitée au conteneur du widget : la version précédente
      // surveillait tout `document.body` en profondeur, donc réagissait à chaque
      // mutation de la page pendant 15 secondes.
      removeUnwantedCaption(node);
      captionWatcher = new MutationObserver(() => removeUnwantedCaption(node));
      captionWatcher.observe(node, { childList: true, subtree: true });
      stopWatching = window.setTimeout(() => captionWatcher?.disconnect(), CAPTION_WATCH_MS);
    };

    const cleanup = () => {
      window.clearTimeout(stopWatching);
      captionWatcher?.disconnect();
    };

    // Navigateur sans IntersectionObserver : on charge sans différer plutôt que
    // de ne jamais afficher les avis.
    if (typeof IntersectionObserver === "undefined") {
      activate();
      return cleanup;
    }

    const viewportWatcher = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        viewportWatcher.disconnect();
        activate();
      },
      { rootMargin: PRELOAD_MARGIN },
    );

    viewportWatcher.observe(node);

    return () => {
      viewportWatcher.disconnect();
      cleanup();
    };
  }, []);

  // `welcome-reviews` sert de point d'accroche au thème sombre : le widget est rendu
  // dans le document (pas dans une iframe), donc stylable — voir globals.css.
  return (
    <div ref={containerRef} className="welcome-reviews">
      {/* Rendu inconditionnellement : la plateforme doit trouver cette cible dans
          le DOM, et le conteneur reste sans hauteur jusqu'au montage du widget. */}
      <div className={`elfsight-app-${ELFSIGHT_APP_ID}`} data-elfsight-app-lazy />
    </div>
  );
}
