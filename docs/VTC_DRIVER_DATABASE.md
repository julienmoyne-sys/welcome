# Configuration serveur des contenus chauffeur

Les services à bord et les coups de cœur sont lus dans PostgreSQL via Neon. Tant que la base
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
réexécutable sans dupliquer cet exemple.

## 3. Choisir le chauffeur affiché

Ajouter dans Vercel, pour chaque déploiement concerné :

```text
VTC_DRIVER_SLUG=demo
NEXT_PUBLIC_VTC_DRIVER_SLUG=demo
```

Créer un slug différent pour chaque chauffeur ou tablette. Les deux valeurs doivent correspondre.
Après toute modification des variables Vercel, redéployer l’application.

## 4. Ajouter les contenus d’un chauffeur

Créer d’abord le chauffeur :

```sql
INSERT INTO vtc_drivers (slug, display_name)
VALUES ('jean-dupont', 'Jean, votre chauffeur');
```

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
