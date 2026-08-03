# Welcome Coworking — site web

Site vitrine de Welcome Coworking (Strasbourg), construit avec **Next.js App Router**.

## Développement

```sh
npm install
npm run dev      # serveur de développement
npm run build    # build de production
npm start        # sert le build de production
npm run lint     # ESLint (config Next.js + Prettier)
npm run typecheck
```

## Structure

```
src/app/                 routes (App Router)
  layout.tsx             coquille HTML, métadonnées globales, polices, thème
  page.tsx               accueil
  faq/page.tsx           /faq
  <slug>/page.tsx        pages légales
  sitemap.ts robots.ts   sitemap.xml et robots.txt générés
  not-found.tsx          404
  error.tsx              frontière d'erreur de segment
  global-error.tsx       secours si le root layout échoue
  globals.css            design system (Tailwind v4)
src/components/          sections de page ; ui/ = primitives shadcn
src/hooks/               hooks navigateur (thème, reveal, breakpoint)
src/lib/                 seo.ts, contact.actions.ts, utils.ts
src/assets/              visuels (importés statiquement, jamais dans public/)
```

Chaque dossier de `src/app/` contenant un `page.tsx` devient une URL. Les routes
`/acces`, `/contact`, `/espaces`, `/formules` et `/references` ne sont pas des
pages : ce sont des redirections 308 vers des sections de l'accueil, déclarées
dans `next.config.ts`.

## SEO

- Métadonnées par page via l'API `Metadata`, avec `metadataBase` et une URL
  canonique absolue sur chaque page.
- Données structurées schema.org rendues côté serveur (`src/components/JsonLd.tsx`) :
  `Organization` sur tout le site, `LocalBusiness` sur l'accueil, `FAQPage` sur
  `/faq`, `BreadcrumbList` sur les pages internes.
- `sitemap.xml` et `robots.txt` générés depuis `src/app/`.
- Polices auto-hébergées par `next/font` : aucune requête vers Google Fonts.
- Toutes les pages sont prérendues en statique — le contenu est dans le HTML
  initial, sans exécution de JavaScript.

Quand vous ajoutez une page, pensez à l'inscrire dans `src/app/sitemap.ts`.

> **Attention** : une page qui déclare son propre `openGraph` remplace celui du
> layout parent au lieu de le compléter. Étalez toujours `OG_DEFAULTS`
> (`src/lib/seo.ts`) pour conserver `og:site_name` et `og:locale`.

## Thème clair / sombre

Le thème repose sur **`next-themes`**, configuré dans
`src/components/ThemeProvider.tsx` en stratégie `class` — ce qu'attend la variante
Tailwind `@custom-variant dark (&:is(.dark *))` de `globals.css`. Il gère la
persistance, le suivi de la préférence système et ses changements en cours de
session, la synchronisation entre onglets et le script anti-FOUC.

`src/hooks/useTheme.ts` est un adaptateur mince par-dessus : il n'ajoute que le
fondu de 360 ms propre à ce site (classe `.theme-transition`), que `next-themes` ne
fournit pas. Consommez-le plutôt que `next-themes` directement, sauf pour les
composants shadcn qui attendent son API (`ui/sonner.tsx`).

La clé de stockage `welcome-theme` est **nommément citée dans la page « Politique
de cookies »** : la changer romprait à la fois la préférence des visiteurs
existants et l'exactitude de cette page légale.

## Visuels

Les images vivent dans `src/assets/` et sont **importées statiquement**, jamais
placées dans `public/` :

```tsx
import Image from "next/image";
import openSpace from "../assets/open-space.jpg";

<Image src={openSpace} alt="…" sizes="(min-width: 1024px) 25vw, 100vw" />;
```

L'import statique donne à Next les dimensions intrinsèques — donc pas de décalage
de mise en page — et une URL empreintée par le build, immuable en cache. Next sert
ensuite des variantes AVIF/WebP redimensionnées selon l'écran.

Règles à respecter :

- toujours renseigner `sizes` dès que la largeur d'affichage dépend du viewport,
  sinon Next télécharge la plus grande variante ;
- `priority` uniquement sur les visuels au-dessus de la ligne de flottaison (ici :
  le visuel d'en-tête de l'accueil et le logo) ; ailleurs le `lazy` par défaut ;
- `fill` quand le conteneur impose le cadre (il doit être `relative`), sinon
  laisser les dimensions intrinsèques.

Seule exception, dans `AccessSection` : une balise **SVG** `<image>` ne peut pas
accueillir `next/image`, elle utilise donc `logoRond.src`.

Pour ajouter un visuel, déposez le fichier dans `src/assets/` et importez-le. Vérifiez
son format réel avant de choisir l'extension (`file <nom>`) : plusieurs visuels du
projet étaient des PNG nommés `.jpg`, ce qui trompe le `Content-Type` déduit de
l'extension. Préférez le JPEG pour une photographie — le PNG est sans perte et pèse
plusieurs fois plus lourd à qualité visuelle égale.

Trois visuels ne sont importés par aucun composant et peuvent être supprimés :
`contact-lounge.jpg`, `hero-welcome.jpg`, `welcome-logo.png`.

## Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `RESEND_API_KEY` | requise — envoi des e-mails du formulaire de contact via Resend |

## Construit avec

- Next.js (App Router) et React
- TypeScript
- Tailwind CSS v4 et shadcn/ui
- Zod pour la validation du formulaire, Resend pour l'envoi
