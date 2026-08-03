"use client";

import { Cookie, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Link } from "@/i18n/navigation";

const STORAGE_KEY = "welcome-cookie-notice";

export function CookieBanner() {
  const t = useTranslations("cookieBanner");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      /* stockage indisponible */
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "acknowledged");
    } catch {
      /* stockage indisponible */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="mx-auto flex w-full max-w-[980px] flex-col gap-4 rounded-[20px] border border-welcome-black/[0.08] bg-welcome-white/95 p-5 shadow-[0_12px_40px_rgba(11,11,11,0.14)] backdrop-blur-md sm:flex-row sm:items-center sm:gap-6 sm:p-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-welcome-gold/15">
          <Cookie className="h-5 w-5 text-welcome-gold" strokeWidth={1.6} />
        </div>

        <div className="flex-1">
          <p className="font-manrope text-[15px] font-semibold text-welcome-black">{t("title")}</p>
          <p className="mt-1 font-inter text-[13.5px] leading-[1.6] text-welcome-body">
            {t("text")}{" "}
            <Link
              href="/politique-de-cookies"
              className="font-medium text-welcome-gold underline-offset-4 hover:underline"
            >
              {t("more")}
            </Link>
            {" · "}
            <Link
              href="/gestion-des-cookies"
              className="font-medium text-welcome-gold underline-offset-4 hover:underline"
            >
              {t("manage")}
            </Link>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex h-[46px] items-center justify-center rounded-[12px] bg-welcome-gold px-6 font-manrope text-[14.5px] font-semibold text-[#0b0b0b] transition-transform duration-200 hover:-translate-y-[1px]"
          >
            {t("accept")}
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label={t("close")}
            className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-[12px] border border-welcome-black/10 text-welcome-body transition-colors hover:bg-welcome-cream"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}
