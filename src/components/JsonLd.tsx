/**
 * Injecte un bloc de données structurées schema.org.
 *
 * Rendu côté serveur : le JSON-LD est présent dans le HTML initial, donc lisible
 * par les crawlers sans exécution de JavaScript.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Le contenu provient de constantes du projet, jamais d'une saisie utilisateur.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
