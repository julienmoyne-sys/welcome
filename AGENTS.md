# Notes pour les agents

Ce projet utilise **Next.js (App Router)**. Les routes vivent dans `src/app/`, une
par dossier contenant un `page.tsx`. Il n'y a ni `src/routes/`, ni `src/pages/`, ni
`routeTree.gen.ts` : le projet a été migré depuis TanStack Start, ne recréez pas ces
conventions.

Deux pièges, détaillés dans `README.md` (sections « SEO » et « Visuels ») :

- un `openGraph` déclaré dans une page **remplace** celui du layout au lieu de le
  compléter — étalez toujours `OG_DEFAULTS` de `src/lib/seo.ts` ;
- les visuels sont dans `src/assets/`, importés statiquement et rendus par
  `next/image` — n'utilisez ni `<img>`, ni `public/` pour une image.

Avant de proposer un changement terminé : `npm run typecheck`, `npm run lint` et
`npm run build` doivent passer. Le lint sort 15 avertissements connus, issus des
règles React Compiler sur du code antérieur à la migration ; n'en ajoutez pas.
