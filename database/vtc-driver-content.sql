CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS vtc_drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  display_name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vtc_driver_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES vtc_drivers(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('service', 'favorite')),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  description text NOT NULL CHECK (char_length(description) BETWEEN 1 AND 500),
  address text,
  price_cents integer CHECK (price_cents IS NULL OR price_cents >= 0),
  currency char(3) NOT NULL DEFAULT 'EUR',
  display_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vtc_driver_content
  ADD COLUMN IF NOT EXISTS price_cents integer
  CHECK (price_cents IS NULL OR price_cents >= 0);

ALTER TABLE vtc_driver_content
  ADD COLUMN IF NOT EXISTS currency char(3) NOT NULL DEFAULT 'EUR';

CREATE INDEX IF NOT EXISTS vtc_driver_content_driver_kind_idx
  ON vtc_driver_content(driver_id, kind, display_order)
  WHERE is_visible = true;

INSERT INTO vtc_drivers (slug, display_name)
VALUES ('demo', 'Votre chauffeur Welcome')
ON CONFLICT (slug) DO UPDATE SET display_name = EXCLUDED.display_name;

INSERT INTO vtc_driver_content (driver_id, kind, title, description, display_order)
SELECT id, 'service', 'Bouteilles d’eau à disposition',
       'Une bouteille d’eau individuelle peut vous être proposée pendant le trajet.', 10
FROM vtc_drivers
WHERE slug = 'demo'
  AND NOT EXISTS (
    SELECT 1 FROM vtc_driver_content c
    WHERE c.driver_id = vtc_drivers.id AND c.kind = 'service'
      AND c.title = 'Bouteilles d’eau à disposition'
  );

INSERT INTO vtc_driver_content
  (driver_id, kind, title, description, price_cents, currency, display_order)
SELECT id, 'service', 'Chewing-gum', 'Un paquet Freedent menthe ou fraîcheur.', 200, 'EUR', 20
FROM vtc_drivers
WHERE slug = 'demo'
  AND NOT EXISTS (
    SELECT 1 FROM vtc_driver_content c
    WHERE c.driver_id = vtc_drivers.id AND c.kind = 'service'
      AND c.title = 'Chewing-gum'
  );
