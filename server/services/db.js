import pool from '../config/db.js';
// export async function test() {
//   const result = await pool.query(`SELECT COUNT(*) FROM dupe`);
//   return Number(result.rows[0].count); // Convert from string to number
// }

/**
* Finds an exact dupe by target fragrance name.
* @param {string} name
* @returns {Promise<object|null>}
*/
export async function findExactDupe(name) {
  const result = await pool.query(
    `
    SELECT
      data->>'dupe' AS dupe,
      data->>'category' AS category,
      data->>'dupelink' AS dupelink,
      data->>'dupebrand' AS dupebrand
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
* @param {string} category
* @returns {Promise<object|null>}
*/
export async function findCategoryDupe(category) {
  const result = await pool.query(
    `
    SELECT
      data->>'dupe' AS dupe,
      data->>'category' AS category,
      data->>'dupelink' AS dupelink,
      data->>'dupebrand' AS dupebrand
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
