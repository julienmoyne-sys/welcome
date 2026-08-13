import { Mail, MessageCircle, Phone } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export function HomeContactSection() {
  const t = useTranslations("homeContact");
  const contact = useTranslations("contact");

  return (
    <section className="bg-welcome-cream px-6 py-[100px] lg:px-10 lg:py-[120px]">
      <div className="mx-auto max-w-[900px] rounded-[24px] border border-welcome-black/[0.07] bg-welcome-white px-7 py-12 text-center shadow-[0_20px_60px_-40px_rgba(11,11,11,0.3)] sm:px-12 sm:py-16">
        <p className="font-inter text-[14px] font-medium uppercase tracking-[0.14em] text-welcome-sage">
          {contact("eyebrow")}
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl font-manrope text-[34px] font-semibold leading-tight tracking-tight text-welcome-black sm:text-[42px]">
          {t("title")}
        </h2>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-4 font-inter text-[15px] text-welcome-body">
          <a
            href="tel:+33622805536"
            className="inline-flex items-center gap-2 transition-colors hover:text-welcome-gold"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {contact("info.phone")}
          </a>
          <a
            href="mailto:contact@welcome-coworking.com"
            className="inline-flex items-center gap-2 transition-colors hover:text-welcome-gold"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            contact@welcome-coworking.com
          </a>
          <a
            href="https://wa.me/33622805536"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-welcome-gold"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            WhatsApp
          </a>
        </div>

        <Link
          href="/contact"
          className="mt-9 inline-flex h-[52px] items-center justify-center rounded-[12px] bg-welcome-gold px-8 font-manrope text-[16px] font-semibold text-[#0b0b0b] transition-all duration-200 hover:brightness-105 hover:shadow-lg"
        >
          {t("button")}
        </Link>
      </div>
    </section>
  );
}
