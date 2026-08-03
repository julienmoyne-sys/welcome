import type { Metadata } from "next";
import Link from "next/link";

// Le statut HTTP 404 suffit à écarter la page de l'index : pas besoin de noindex.
export const metadata: Metadata = {
  title: "Page introuvable — Welcome Coworking",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-manrope text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 font-manrope text-xl font-semibold text-foreground">
          Page introuvable
        </h2>
        <p className="mt-2 font-inter text-sm text-muted-foreground">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-manrope text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
