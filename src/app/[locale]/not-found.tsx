import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

// Le statut HTTP 404 suffit à écarter la page de l'index : pas besoin de noindex.
export default function NotFound() {
  const t = useTranslations("errors.notFound");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-manrope text-7xl font-bold text-foreground">{t("code")}</h1>
        <h2 className="mt-4 font-manrope text-xl font-semibold text-foreground">{t("heading")}</h2>
        <p className="mt-2 font-inter text-sm text-muted-foreground">{t("text")}</p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-manrope text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    </div>
  );
}
