"use client";

import Image from "next/image";
import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Check } from "lucide-react";
import { useReveal } from "../hooks/useReveal";
import { submitContact } from "../lib/contact.actions";
import contactPhoto from "../assets/contact-photo-real.png";

const needs = ["Open space", "Bureau privatif", "Salle de réunion", "Espace événementiel", "Autre"];

export function ContactSection() {
  const { ref, visible } = useReveal<HTMLElement>();

  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    need: "",
    message: "",
    rgpd: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const update = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setStatus("submitting");

    try {
      const result = await submitContact(form);

      if (result.status === "invalid") {
        setStatus("error");
        setErrors(result.fieldErrors);
        return;
      }

      if (result.status === "error") {
        setStatus("error");
        return;
      }

      setStatus("success");
      setForm({
        name: "",
        company: "",
        email: "",
        phone: "",
        need: "",
        message: "",
        rgpd: false,
      });
    } catch {
      // Échec réseau ou erreur non gérée côté serveur.
      setStatus("error");
    }
  };

  return (
    <section ref={ref} className="bg-welcome-cream py-[100px] lg:py-[140px]">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        {/* anchor aligné sur le titre de la section */}
        <span id="contact" className="block scroll-mt-[120px]" aria-hidden="true" />
        {/* header */}
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <p className="font-inter text-[15px] font-medium uppercase tracking-[0.12em] text-welcome-sage">
            Contact
          </p>
          <h2 className="mt-4 font-manrope text-4xl font-semibold leading-[1.12] tracking-tight text-welcome-black md:text-5xl">
            Et si votre prochaine journée de travail commençait{" "}
            <span className="text-welcome-gold">ici</span> ?
          </h2>
          <p className="mt-5 font-inter text-lg leading-relaxed text-welcome-body/80">
            Vous souhaitez visiter Welcome, réserver un espace ou simplement découvrir les lieux ?
            Nous serons ravis de vous accueillir.
          </p>
        </div>

        {/* two columns */}
        <div className="mt-16 grid items-stretch gap-12 lg:mt-20 lg:grid-cols-[45%_55%] lg:gap-20">
          {/* left column */}
          <div
            className={`flex flex-col transition-all duration-700 delay-100 ${
              visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="overflow-hidden rounded-[20px]">
              <Image
                src={contactPhoto}
                alt="Espace de coworking Welcome"
                // Colonne de 45 % dans un conteneur plafonné à 1280 px avec padding :
                // ≥ 1280 → 45 % de 1200 = 540 px ; sinon la largeur réelle du créneau.
                sizes="(min-width: 1280px) 540px, (min-width: 1024px) 45vw, calc(100vw - 48px)"
                className="welcome-photo aspect-square w-full object-cover"
              />
            </div>

            {/* WhatsApp question card */}
            <div className="mt-6 rounded-[20px] border border-welcome-black/[0.06] bg-welcome-white p-7 shadow-[0_14px_40px_-28px_rgba(11,11,11,0.22)] transition-all duration-200 hover:-translate-y-[3px]">
              <h3 className="font-manrope text-lg font-semibold text-welcome-black">
                Poser une question
              </h3>
              <p className="mt-2 font-inter text-[15px] leading-relaxed text-welcome-body/70">
                Une question rapide ? Écrivez-nous directement sur WhatsApp, nous vous répondons au
                plus vite.
              </p>
              <a
                href="https://wa.me/33622805536"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex h-[54px] w-full items-center justify-center gap-2.5 rounded-[14px] bg-[#25D366] px-6 font-manrope text-[16px] font-semibold text-[#0b0b0b] transition-all duration-200 hover:brightness-105 hover:shadow-lg sm:w-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
            </div>

            <div className="mt-6 rounded-[20px] border border-welcome-black/[0.06] bg-welcome-white p-7 shadow-[0_14px_40px_-28px_rgba(11,11,11,0.22)] transition-all duration-200 hover:-translate-y-[3px]">
              <h3 className="font-manrope text-lg font-semibold text-welcome-black">
                Informations
              </h3>
              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-welcome-cream">
                    <MapPin size={18} className="text-welcome-black" />
                  </div>
                  <div>
                    <p className="font-manrope text-[15px] font-semibold text-welcome-black">
                      Welcome Coworking
                    </p>
                    <a
                      href="https://www.google.com/maps/dir/?api=1&destination=204%20avenue%20de%20Colmar%2C%2067100%20Strasbourg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-inter text-sm leading-relaxed text-welcome-body/70 transition-colors hover:text-welcome-gold"
                    >
                      204 avenue de Colmar, 67100 Strasbourg
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-welcome-cream">
                    <Phone size={18} className="text-welcome-black" />
                  </div>
                  <div>
                    <p className="font-manrope text-[15px] font-semibold text-welcome-black">
                      Téléphone
                    </p>
                    <a
                      href="https://wa.me/33622805536"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-inter text-sm text-welcome-body/70 transition-colors hover:text-welcome-gold"
                    >
                      +33 6 22 80 55 36
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-welcome-cream">
                    <Mail size={18} className="text-welcome-black" />
                  </div>
                  <div>
                    <p className="font-manrope text-[15px] font-semibold text-welcome-black">
                      Adresse e-mail
                    </p>
                    <a
                      href="mailto:contact@welcome-coworking.com"
                      className="font-inter text-sm text-welcome-body/70 transition-colors hover:text-welcome-gold"
                    >
                      contact@welcome-coworking.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-welcome-cream">
                    <Clock size={18} className="text-welcome-black" />
                  </div>
                  <div>
                    <p className="font-manrope text-[15px] font-semibold text-welcome-black">
                      Horaires
                    </p>
                    <p className="font-inter text-sm text-welcome-body/70">
                      Clients : 24/24 7/7 / Visites : sur RDV
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* right column */}
          <div
            className={`flex flex-col transition-all duration-700 delay-200 ${
              visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <form
              onSubmit={handleSubmit}
              className="flex h-full flex-col rounded-[20px] border border-welcome-black/[0.06] bg-welcome-white p-7 shadow-[0_14px_40px_-28px_rgba(11,11,11,0.22)] lg:p-10"
            >
              <h3 className="font-manrope text-2xl font-semibold text-welcome-black">
                Organiser une visite
              </h3>
              <p className="mt-2 font-inter text-[15px] leading-relaxed text-welcome-body/70">
                Parlez-nous de votre besoin. Nous vous répondrons rapidement afin de convenir d’un
                rendez-vous.
              </p>

              <div className="mt-7 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block font-manrope text-sm font-semibold text-welcome-black"
                    >
                      Nom
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      className="h-12 w-full rounded-[12px] border border-welcome-black/10 bg-welcome-cream/50 px-4 font-inter text-[15px] text-welcome-black outline-none transition-all placeholder:text-welcome-body/40 focus:border-welcome-gold focus:ring-2 focus:ring-welcome-gold/20"
                      placeholder="Votre nom"
                    />
                    {errors.name && (
                      <p className="mt-1.5 font-inter text-xs text-red-600">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="company"
                      className="mb-2 block font-manrope text-sm font-semibold text-welcome-black"
                    >
                      Entreprise{" "}
                      <span className="font-normal text-welcome-body/50">(optionnel)</span>
                    </label>
                    <input
                      id="company"
                      type="text"
                      value={form.company}
                      onChange={(e) => update("company", e.target.value)}
                      className="h-12 w-full rounded-[12px] border border-welcome-black/10 bg-welcome-cream/50 px-4 font-inter text-[15px] text-welcome-black outline-none transition-all placeholder:text-welcome-body/40 focus:border-welcome-gold focus:ring-2 focus:ring-welcome-gold/20"
                      placeholder="Votre entreprise"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block font-manrope text-sm font-semibold text-welcome-black"
                    >
                      Adresse e-mail
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      className="h-12 w-full rounded-[12px] border border-welcome-black/10 bg-welcome-cream/50 px-4 font-inter text-[15px] text-welcome-black outline-none transition-all placeholder:text-welcome-body/40 focus:border-welcome-gold focus:ring-2 focus:ring-welcome-gold/20"
                      placeholder="vous@exemple.fr"
                    />
                    {errors.email && (
                      <p className="mt-1.5 font-inter text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block font-manrope text-sm font-semibold text-welcome-black"
                    >
                      Téléphone{" "}
                      <span className="font-normal text-welcome-body/50">(optionnel)</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className="h-12 w-full rounded-[12px] border border-welcome-black/10 bg-welcome-cream/50 px-4 font-inter text-[15px] text-welcome-black outline-none transition-all placeholder:text-welcome-body/40 focus:border-welcome-gold focus:ring-2 focus:ring-welcome-gold/20"
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2.5 block font-manrope text-sm font-semibold text-welcome-black">
                    Votre besoin
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {needs.map((need) => {
                      const selected = form.need === need;
                      return (
                        <button
                          key={need}
                          type="button"
                          onClick={() => update("need", need)}
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-inter text-sm transition-all ${
                            selected
                              ? "border-welcome-gold bg-welcome-gold/10 text-welcome-black"
                              : "border-welcome-black/10 bg-welcome-cream/40 text-welcome-body/80 hover:border-welcome-black/20"
                          }`}
                        >
                          {selected && <Check size={14} className="text-welcome-gold" />}
                          {need}
                        </button>
                      );
                    })}
                  </div>
                  {errors.need && (
                    <p className="mt-1.5 font-inter text-xs text-red-600">{errors.need}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block font-manrope text-sm font-semibold text-welcome-black"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    className="w-full resize-none rounded-[12px] border border-welcome-black/10 bg-welcome-cream/50 px-4 py-3 font-inter text-[15px] text-welcome-black outline-none transition-all placeholder:text-welcome-body/40 focus:border-welcome-gold focus:ring-2 focus:ring-welcome-gold/20"
                    placeholder="Dites-nous en plus sur votre projet..."
                  />
                  {errors.message && (
                    <p className="mt-1.5 font-inter text-xs text-red-600">{errors.message}</p>
                  )}
                </div>

                <div className="flex items-start gap-3">
                  {/* Case à cocher personnalisée : le texte de consentement étant un
                      frère et non un `<label>`, il faut le désigner explicitement,
                      sinon la case est annoncée sans libellé. */}
                  <button
                    type="button"
                    onClick={() => update("rgpd", !form.rgpd)}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                      form.rgpd
                        ? "border-welcome-gold bg-welcome-gold"
                        : "border-welcome-black/20 bg-welcome-cream/50"
                    }`}
                    aria-checked={form.rgpd}
                    role="checkbox"
                    aria-labelledby="rgpd-label"
                    aria-describedby={errors.rgpd ? "rgpd-error" : undefined}
                    aria-invalid={errors.rgpd ? true : undefined}
                  >
                    {form.rgpd && <Check size={12} className="text-welcome-black" />}
                  </button>
                  <p
                    id="rgpd-label"
                    className="font-inter text-xs leading-relaxed text-welcome-body/60"
                  >
                    J’accepte que Welcome Coworking conserve mes informations afin de répondre à ma
                    demande, conformément à la politique de confidentialité.
                  </p>
                </div>
                {errors.rgpd && (
                  <p id="rgpd-error" className="font-inter text-xs text-red-600">
                    {errors.rgpd}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="inline-flex h-[54px] w-full items-center justify-center rounded-[14px] bg-welcome-gold px-8 font-manrope text-[16px] font-semibold text-[#0b0b0b] transition-all duration-200 hover:brightness-105 hover:shadow-lg disabled:opacity-70 sm:w-auto"
                >
                  {status === "submitting" ? "Envoi en cours..." : "Envoyer"}
                </button>

                {status === "success" && (
                  <p className="rounded-[12px] bg-welcome-sage/10 px-4 py-3 font-inter text-sm text-welcome-sage">
                    Merci pour votre message. Nous vous recontacterons très rapidement.
                  </p>
                )}
                {status === "error" && Object.keys(errors).length === 0 && (
                  <p className="rounded-[12px] bg-red-50 px-4 py-3 font-inter text-sm text-red-700">
                    Une erreur est survenue. Veuillez réessayer.
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
