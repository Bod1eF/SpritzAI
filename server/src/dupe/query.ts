import pool from '../db.ts';
import { Dupe } from './types';

/**
 * Finds an exact dupe by target fragrance name.
 */
export async function findExactDupe(name: string): Promise<Dupe | null> {
  const result = await pool.query(
    `
    SELECT
      data->>'dupe' AS name,
      data->>'category' AS category,
      data->>'dupelink' AS link,
      data->>'dupebrand' AS brand
    FROM dupe
    WHERE LOWER(data->>'target') = LOWER($1)
    LIMIT 1
    `,
    [name]
  );
  return result.rows[0] || null;
}

/**
* Finds a category-based dupe if no exact match found.
*/
export async function findCategoryDupe(category: string): Promise<Dupe | null> {
  const result = await pool.query(
    `
    SELECT
      data->>'dupe' AS name,
      data->>'category' AS category,
      data->>'dupelink' AS link,
      data->>'dupebrand' AS brand
    FROM dupe
    WHERE LOWER(data->>'category') = LOWER($1)
    ORDER BY
      CASE
        WHEN data->>'dupelink' IS NOT NULL AND data->>'dupelink' != '' THEN 0
        ELSE 1
      END
    LIMIT 1;
    `,
    [category]
  );
 return result.rows[0] || null;
}
