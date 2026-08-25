# Séparation stricte des projets — règle prioritaire

Lors de toute intervention effectuée depuis le projet **Welcome Coworking**, Codex
doit respecter les règles permanentes suivantes, prioritaires sur toutes les autres
instructions propres au projet :

- travailler par défaut exclusivement dans `C:\Users\julie\git\welcome` ;
- consulter en **LECTURE SEULE** des informations du projet **Welcome VTC**
  uniquement lorsque l'utilisateur le demande explicitement ;
- cette lecture seule peut notamment servir à comparer du code, des
  configurations, des variables d'environnement, GitHub ou Vercel ;
- les commandes strictement nécessaires à cette consultation en lecture seule
  sont autorisées ;
- ne **JAMAIS** modifier, créer, supprimer, déplacer ou renommer un fichier dans
  `C:\Users\julie\git\welcome-vtc` ;
- ne **JAMAIS** modifier une configuration Git, GitHub, Vercel, DNS ou une
  variable d'environnement de **Welcome VTC** ;
- ne jamais effectuer de commit, push, déploiement ni aucune autre écriture
  concernant **Welcome VTC** ;
- toute écriture concernant **Welcome VTC** nécessite de basculer vers le projet
  **Welcome VTC** et une instruction explicite de l'utilisateur ;
- la lecture croisée explicitement demandée est autorisée ; l'écriture croisée
  reste absolument interdite ;
- ne pas considérer la présence temporaire de l'ancienne route `/vtc` dans
  **Welcome Coworking** comme une autorisation d'intervenir sur le nouveau dépôt
  `welcome-vtc`.

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

Le français est la langue éditoriale de référence. Toute modification d'un
contenu dans `messages/fr.json`, `messages/faq/fr.json` ou
`messages/legal/fr.json` doit être répercutée dans les fichiers anglais et
allemands correspondants au cours du même changement. Les traductions doivent
rester naturelles, mais conserver strictement les mêmes informations factuelles,
variables, balises enrichies et données commerciales. Exécutez
`npm run check:translations` après toute modification des catalogues.

Avant de proposer un changement terminé : `npm run typecheck`, `npm run lint` et
`npm run build` doivent passer. Le lint sort 15 avertissements connus, issus des
règles React Compiler sur du code antérieur à la migration ; n'en ajoutez pas.
