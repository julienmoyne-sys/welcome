# Contexte du projet

## Présentation

Ce dépôt contient le site vitrine de **Welcome Coworking**, situé à Strasbourg.
Il repose sur Next.js 16 avec l’App Router, React 19, TypeScript, Tailwind CSS 4
et des composants shadcn/ui.

## Développement local

- Gestionnaire de paquets : **Bun** (`bun.lock`).
- Lancer le serveur : `bun run dev`.
- URL locale habituelle : `http://localhost:3000`.
- Dans VS Code, utiliser la configuration **Next.js: bun dev** définie dans
  `.vscode/launch.json`.
- Variable requise pour l’envoi du formulaire de contact : `RESEND_API_KEY`.

## Architecture et conventions

- Les routes utilisent exclusivement l’App Router et vivent dans `src/app/`.
- Une route correspond à un dossier contenant un fichier `page.tsx`.
- Ne pas recréer les anciennes conventions TanStack Start (`src/routes/`,
  `src/pages/` ou `routeTree.gen.ts`).
- Les composants sont dans `src/components/`, les hooks dans `src/hooks/` et
  les utilitaires dans `src/lib/`.
- Les visuels sont stockés dans `src/assets/`, importés statiquement et rendus
  avec `next/image`. Ne pas placer de nouvelles images dans `public/` et ne pas
  utiliser de balise HTML `<img>`.
- Une page qui définit `openGraph` doit étaler `OG_DEFAULTS` depuis
  `src/lib/seo.ts`, car les métadonnées de page remplacent celles du layout.
- Toute nouvelle page doit être ajoutée à `src/app/sitemap.ts`.

## Vérifications avant livraison

Ces trois commandes doivent réussir avant de considérer une modification comme
terminée :

```sh
npm run typecheck
npm run lint
npm run build
```

Le lint comporte 15 avertissements React Compiler déjà connus. Ne pas en
ajouter. Le fichier `README.md` fournit davantage de détails sur le SEO, le
thème clair/sombre et la gestion des images.

> Pour les assistants de code : lire également `AGENTS.md`, qui contient les
> instructions prioritaires du dépôt.
