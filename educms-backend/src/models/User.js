const db = require('../config/database');

const PUBLIC_COLUMNS = 'user_id, username, email, first_name, last_name, role, bio, avatar, created_at, updated_at, last_login, is_active, email_verified';

const findById = async (id) => (await db.query(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE user_id = $1`, [id])).rows[0] || null;
const findByEmail = async (email) => (await db.query('SELECT * FROM users WHERE email = $1', [email])).rows[0] || null;
const findByUsername = async (username) => (await db.query('SELECT * FROM users WHERE username = $1', [username])).rows[0] || null;

const create = async ({ username, email, password_hash, first_name, last_name, role = 'subscriber' }) => {
  const r = await db.query(
    `INSERT INTO users (username, email, password_hash, first_name, last_name, role)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING ${PUBLIC_COLUMNS}`,
    [username, email, password_hash, first_name || null, last_name || null, role]
  );
  return r.rows[0];
};

const list = async ({ page, limit, offset }) => {
  const total = (await db.query('SELECT COUNT(*) FROM users')).rows[0].count;
  const rows = (await db.query(`SELECT ${PUBLIC_COLUMNS} FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset])).rows;
  return { rows, total: parseInt(total) };
};

const update = async (id, fields) => {
  const keys = Object.keys(fields);
  if (keys.length === 0) return findById(id);
  const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  const r = await db.query(`UPDATE users SET ${sets} WHERE user_id = $1 RETURNING ${PUBLIC_COLUMNS}`, [id, ...Object.values(fields)]);
  return r.rows[0] || null;
};

const remove = async (id) => (await db.query('DELETE FROM users WHERE user_id = $1', [id])).rowCount > 0;
const touchLogin = async (id) => db.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1', [id]);

module.exports = { findById, findByEmail, findByUsername, create, list, update, remove, touchLogin };
