"use client";

import { useEffect } from "react";

/**
 * Dernier filet : n'intervient que si le root layout lui-même échoue. Il remplace
 * donc `<html>`/`<body>` et ne peut compter sur aucune feuille de style de l'app —
 * d'où les styles en ligne.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          font: "15px/1.5 system-ui, -apple-system, sans-serif",
          background: "#fafaf8",
          color: "#0b0b0b",
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "28rem", width: "100%", textAlign: "center", padding: "2rem" }}>
          <h1 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem" }}>
            Cette page n'a pas pu se charger
          </h1>
          <p style={{ color: "#5a5a5a", margin: "0 0 1.5rem" }}>
            Un problème est survenu de notre côté. Vous pouvez recharger la page ou revenir à
            l'accueil.
          </p>
          <div
            style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}
          >
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.375rem",
                font: "inherit",
                cursor: "pointer",
                border: "1px solid transparent",
                background: "#0b0b0b",
                color: "#fff",
              }}
            >
              Réessayer
            </button>
            {/* Aucun routeur client disponible ici : le lien doit être un `<a>` brut. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.375rem",
                font: "inherit",
                textDecoration: "none",
                border: "1px solid #d1d5db",
                background: "#fff",
                color: "#0b0b0b",
              }}
            >
              Retour à l'accueil
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
