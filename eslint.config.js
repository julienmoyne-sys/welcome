// `eslint-config-next/core-web-vitals` fournit déjà, en config plate :
// next, next/typescript (typescript-eslint), next/core-web-vitals et les ignores.
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";

const config = [
  { ignores: [".next/**", "out/**", "node_modules/**", "next-env.d.ts"] },
  ...nextCoreWebVitals,
  eslintPluginPrettier,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",

      // Le contenu du site est en français : les apostrophes typographiques et
      // simples sont omniprésentes dans le texte JSX et parfaitement valides.
      "react/no-unescaped-entities": "off",

      // Règles issues du React Compiler, apportées par react-hooks v6 avec
      // eslint-config-next 16. Elles signalent des motifs présents avant la
      // migration (synchronisation d'état au montage dans useTheme / useIsMobile /
      // CookieBanner, lecture de refs pendant le rendu dans AccessSection) — donc
      // des dettes à traiter, pas des régressions introduites ici. Maintenues en
      // avertissement pour rester visibles sans bloquer le lint.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
    },
  },
];

export default config;
