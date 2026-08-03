"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors.boundary");
  const router = useRouter();

  useEffect(() => {
    // React n'envoie pas les erreurs interceptées par une frontière à
    // window.onerror en production : c'est ici qu'un service de suivi d'erreurs
    // (Sentry, etc.) doit être branché si vous en ajoutez un.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-manrope text-xl font-semibold tracking-tight text-foreground">
          {t("heading")}
        </h1>
        <p className="mt-2 font-inter text-sm text-muted-foreground">{t("text")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              // `refresh` réexécute le rendu serveur du segment, `reset` remonte la
              // frontière d'erreur côté client.
              router.refresh();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-manrope text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("retry")}
          </button>
          {/* Navigation complète volontaire : après une erreur de rendu, mieux vaut
              repartir d'une page neuve que réutiliser un routeur client dégradé. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 font-manrope text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {t("home")}
          </a>
        </div>
      </div>
    </div>
  );
}
