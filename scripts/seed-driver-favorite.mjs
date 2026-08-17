import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL est absente.");

const sql = neon(databaseUrl);
const result = await sql`
  INSERT INTO vtc_driver_content
    (driver_id, kind, title, description, address, display_order)
  SELECT id, 'favorite', 'La Corde à Linge',
         'Une adresse conviviale appréciée du chauffeur au cœur de la Petite France.',
         '2 place Benjamin-Zix, 67000 Strasbourg', 10
  FROM vtc_drivers
  WHERE slug = 'demo'
    AND NOT EXISTS (
      SELECT 1 FROM vtc_driver_content c
      WHERE c.driver_id = vtc_drivers.id AND c.kind = 'favorite'
        AND c.title = 'La Corde à Linge'
    )
  RETURNING id, title
`;

const favorites = await sql`
  SELECT c.title, c.address
  FROM vtc_driver_content c
  JOIN vtc_drivers d ON d.id = c.driver_id
  WHERE d.slug = 'demo' AND c.kind = 'favorite' AND c.is_visible = true
  ORDER BY c.display_order, c.created_at
`;

console.log(JSON.stringify({ inserted: result.length, favorites }, null, 2));
