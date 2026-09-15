const db = require('../config/database');

const SELECT_BASE = `SELECT p.*, u.username AS author_name, c.name AS category_name,
  COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tags
  FROM posts p
  LEFT JOIN users u ON p.author_id = u.user_id
  LEFT JOIN categories c ON p.category_id = c.category_id
  LEFT JOIN post_tags pt ON p.post_id = pt.post_id
  LEFT JOIN tags t ON pt.tag_id = t.tag_id`;

const list = async ({ status, category_id, tag, search, featured, author_id, page, limit, offset, sort = 'new' }) => {
  const conditions = [];
  const params = [];
  const add = (sql, val) => { params.push(val); conditions.push(sql.replace('?', `$${params.length}`)); };

  if (status) add('p.status = ?', status);
  if (category_id) add('p.category_id = ?', category_id);
  if (author_id) add('p.author_id = ?', author_id);
  if (featured === 'true' || featured === true) conditions.push('p.is_featured = true');
  if (tag) add('EXISTS (SELECT 1 FROM post_tags pt2 JOIN tags t2 ON pt2.tag_id = t2.tag_id WHERE pt2.post_id = p.post_id AND t2.slug = ?)', tag);
  if (search) add("(p.title ILIKE '%' || ? || '%' OR p.content ILIKE '%' || ? || '%')", search) && params.push(search);

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const order = sort === 'popular' ? 'p.view_count DESC' : sort === 'title' ? 'p.title ASC' : 'p.published_at DESC NULLS LAST, p.created_at DESC';

  const countRes = await db.query(`SELECT COUNT(DISTINCT p.post_id) FROM posts p ${where}`, params);
  const total = parseInt(countRes.rows[0].count);

  const rows = (await db.query(
    `${SELECT_BASE} ${where} GROUP BY p.post_id, u.username, c.name ORDER BY ${order} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  )).rows;
  return { rows, total };
};

const findById = async (id) =>
  (await db.query(`${SELECT_BASE} WHERE p.post_id = $1 GROUP BY p.post_id, u.username, c.name`, [id])).rows[0] || null;

const findBySlug = async (slug) =>
  (await db.query(`${SELECT_BASE} WHERE p.slug = $1 GROUP BY p.post_id, u.username, c.name`, [slug])).rows[0] || null;

const slugExists = async (slug) => (await db.query('SELECT 1 FROM posts WHERE slug = $1', [slug])).rowCount > 0;

const incrementViews = async (id) => db.query('UPDATE posts SET view_count = view_count + 1 WHERE post_id = $1', [id]);
const incrementLikes = async (id) => (await db.query('UPDATE posts SET like_count = like_count + 1 WHERE post_id = $1 RETURNING like_count', [id])).rows[0];

module.exports = { list, findById, findBySlug, slugExists, incrementViews, incrementLikes };
