const db = require('../config/database');

const findById = async (id) => (await db.query('SELECT * FROM categories WHERE category_id = $1', [id])).rows[0] || null;
const findBySlug = async (slug) => (await db.query('SELECT * FROM categories WHERE slug = $1', [slug])).rows[0] || null;

const list = async () =>
  (await db.query('SELECT c.*, (SELECT COUNT(*) FROM posts p WHERE p.category_id = c.category_id AND p.status = $1) AS post_count FROM categories c ORDER BY display_order, name', ['published'])).rows;

const create = async ({ name, slug, description, parent_id, display_order }) => {
  const r = await db.query(
    'INSERT INTO categories (name, slug, description, parent_id, display_order) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [name, slug, description || null, parent_id || null, display_order || 0]
  );
  return r.rows[0];
};

const update = async (id, fields) => {
  const keys = Object.keys(fields);
  if (!keys.length) return findById(id);
  const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  const r = await db.query(`UPDATE categories SET ${sets} WHERE category_id = $1 RETURNING *`, [id, ...Object.values(fields)]);
  return r.rows[0] || null;
};

const remove = async (id) => (await db.query('DELETE FROM categories WHERE category_id = $1', [id])).rowCount > 0;

module.exports = { findById, findBySlug, list, create, update, remove };
