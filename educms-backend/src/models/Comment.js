const db = require('../config/database');

const listForPost = async (postId, { status = 'approved' } = {}) =>
  (await db.query(
    'SELECT c.*, u.username FROM comments c LEFT JOIN users u ON c.user_id = u.user_id WHERE c.post_id = $1 AND c.status = $2 ORDER BY c.created_at ASC',
    [postId, status]
  )).rows;

const listAll = async ({ status, page, limit, offset }) => {
  const params = [];
  let where = '';
  if (status) { params.push(status); where = `WHERE c.status = $${params.length}`; }
  const total = (await db.query(`SELECT COUNT(*) FROM comments c ${where}`, params)).rows[0].count;
  const rows = (await db.query(
    `SELECT c.*, u.username, p.title AS post_title FROM comments c LEFT JOIN users u ON c.user_id = u.user_id LEFT JOIN posts p ON c.post_id = p.post_id ${where} ORDER BY c.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  )).rows;
  return { rows, total: parseInt(total) };
};

const create = async ({ post_id, user_id, parent_id, content, ip_address, user_agent }) => {
  const r = await db.query(
    'INSERT INTO comments (post_id, user_id, parent_id, content, ip_address, user_agent) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [post_id, user_id || null, parent_id || null, content, ip_address || null, user_agent || null]
  );
  return r.rows[0];
};

const setStatus = async (id, status) =>
  (await db.query('UPDATE comments SET status = $1 WHERE comment_id = $2 RETURNING *', [status, id])).rows[0] || null;

const remove = async (id) => (await db.query('DELETE FROM comments WHERE comment_id = $1', [id])).rowCount > 0;

module.exports = { listForPost, listAll, create, setStatus, remove };
