const db = require('../config/database');

const findById = async (id) => (await db.query('SELECT * FROM tags WHERE tag_id = $1', [id])).rows[0] || null;
const findBySlug = async (slug) => (await db.query('SELECT * FROM tags WHERE slug = $1', [slug])).rows[0] || null;
const list = async () => (await db.query('SELECT * FROM tags ORDER BY name')).rows;
const create = async ({ name, slug, description }) => {
  const r = await db.query('INSERT INTO tags (name, slug, description) VALUES ($1,$2,$3) RETURNING *', [name, slug, description || null]);
  return r.rows[0];
};
const remove = async (id) => (await db.query('DELETE FROM tags WHERE tag_id = $1', [id])).rowCount > 0;
const setPostTags = async (client, postId, tagIds) => {
  await client.query('DELETE FROM post_tags WHERE post_id = $1', [postId]);
  for (const tagId of tagIds || []) {
    await client.query('INSERT INTO post_tags (post_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [postId, tagId]);
  }
};

module.exports = { findById, findBySlug, list, create, remove, setPostTags };
