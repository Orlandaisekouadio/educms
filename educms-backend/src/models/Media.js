const db = require('../config/database');

const create = async ({ filename, original_name, file_path, file_type, file_size, mime_type, uploaded_by, alt_text, caption }) => {
  const r = await db.query(
    'INSERT INTO media (filename, original_name, file_path, file_type, file_size, mime_type, uploaded_by, alt_text, caption) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
    [filename, original_name, file_path, file_type || null, file_size || null, mime_type || null, uploaded_by || null, alt_text || null, caption || null]
  );
  return r.rows[0];
};

const list = async ({ page, limit, offset }) => {
  const total = (await db.query('SELECT COUNT(*) FROM media')).rows[0].count;
  const rows = (await db.query('SELECT m.*, u.username AS uploaded_by_name FROM media m LEFT JOIN users u ON m.uploaded_by = u.user_id ORDER BY m.created_at DESC LIMIT $1 OFFSET $2', [limit, offset])).rows;
  return { rows, total: parseInt(total) };
};

const remove = async (id) => (await db.query('DELETE FROM media WHERE media_id = $1 RETURNING *', [id])).rows[0] || null;

const logActivity = async ({ user_id, action, entity_type, entity_id, description, ip_address, user_agent }) =>
  db.query(
    'INSERT INTO activity_log (user_id, action, entity_type, entity_id, description, ip_address, user_agent) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [user_id || null, action, entity_type || null, entity_id || null, description || null, ip_address || null, user_agent || null]
  );

module.exports = { create, list, remove, logActivity };
