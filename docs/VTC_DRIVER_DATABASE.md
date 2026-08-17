# Configuration serveur des contenus chauffeur

Le profil du chauffeur, sa vCard, les services à bord et les coups de cœur sont lus dans PostgreSQL via Neon. Tant que la base
n’est pas configurée, l’API renvoie automatiquement les contenus de démonstration définis dans
`src/lib/driver-content.ts`.

## 1. Créer et relier la base

Dans Vercel, ouvrir le projet puis **Storage / Marketplace**, ajouter **Neon Postgres** et relier
la base aux environnements Production, Preview et Development. Vercel crée alors la variable
`DATABASE_URL`.

Pour travailler localement après avoir relié le projet :

```powershell
vercel env pull .env.local --yes
```

## 2. Créer les tables et l’exemple

Ouvrir l’éditeur SQL de Neon et exécuter intégralement `database/vtc-driver-content.sql`. Le
script crée les tables, les index, le chauffeur `demo` et un premier service d’exemple. Il est
réexécutable sans dupliquer les exemples, dont le coup de cœur « La Corde à Linge ».

## 3. Choisir le chauffeur affiché sur une tablette

Ajouter dans Vercel, pour chaque déploiement concerné :

```text
NEXT_PUBLIC_VTC_DRIVER_ID=1
```

`driver_number` est un numéro unique auto-incrémenté par PostgreSQL. Il identifie la fiche à lire
sur la tablette via `/api/vtc/driver-content?id=1`. Le slug reste accepté comme solution de repli
avec `NEXT_PUBLIC_VTC_DRIVER_SLUG=demo`. Après toute modification des variables Vercel,
redéployer l’application.

## 4. Ajouter les contenus d’un chauffeur

Créer d’abord le chauffeur :

```sql
INSERT INTO vtc_drivers
  (slug, display_name, first_name, bio, other_activities, languages, interests, phone, email, website)
VALUES
  ('jean-dupont', 'Jean Dupont', 'Jean',
   'Chauffeur professionnel attentif à votre confort.',
   ARRAY['Entrepreneur'], ARRAY['Français', 'Anglais'],
   ARRAY['Voyages', 'Gastronomie'], '+33 6 00 00 00 00',
   'jean@example.com', 'https://example.com')
RETURNING driver_number;
```

La colonne `vcard` contient la fiche contact complète au format vCard 3.0. La tablette transforme
directement ce texte en QR code : le passager peut ainsi scanner puis enregistrer le contact sur
son téléphone. Le UUID `id` reste la clé technique utilisée pour les relations internes ;
`driver_number` est l’identifiant numérique stable destiné aux tablettes.

Ajouter ensuite un service :

```sql
INSERT INTO vtc_driver_content
  (driver_id, kind, title, description, price_cents, currency, display_order)
SELECT id, 'service', 'Wi-Fi à bord', 'Demandez le code au chauffeur.', 300, 'EUR', 20
FROM vtc_drivers WHERE slug = 'jean-dupont';
```

Ou un coup de cœur :

```sql
INSERT INTO vtc_driver_content
  (driver_id, kind, title, description, address, display_order)
SELECT id, 'favorite', 'Mon adresse préférée',
       'Une courte recommandation personnelle.', '10 rue Exemple, Strasbourg', 10
FROM vtc_drivers WHERE slug = 'jean-dupont';
```

`display_order` contrôle l’ordre d’affichage et `is_visible = false` permet de masquer une entrée
sans la supprimer. Le prix d’un service est enregistré en centimes dans `price_cents` (`200` =
2 €) ; une valeur `NULL` affiche « Offert ». Aucune route publique d’écriture n’est exposée : les modifications passent pour
le moment par Neon. Un espace chauffeur authentifié pourra être ajouté ensuite sur ces mêmes tables.
