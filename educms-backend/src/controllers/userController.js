const bcrypt = require('bcryptjs');
const db = require('../config/database');
const User = require('../models/User');
const { paginate, getPaginationMeta, successResponse } = require('../utils/helpers');

const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;

const list = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);
    const { rows, total } = await User.list({ page, limit, offset });
    res.json(successResponse({ users: rows, pagination: getPaginationMeta(total, page, limit) }));
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json(successResponse(user));
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { password, role, ...rest } = req.body;
    const fields = { ...rest };
    if (role && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Only admin can change roles' });
    if (role) fields.role = role;
    if (password) fields.password_hash = await bcrypt.hash(password, rounds);
    const updated = await User.update(req.params.id, fields);
    if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
    res.json(successResponse(updated, 'User updated'));
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    if (parseInt(req.params.id) === req.user.user_id) return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    if (!(await User.remove(req.params.id))) return res.status(404).json({ success: false, message: 'User not found' });
    res.json(successResponse(null, 'User deleted'));
  } catch (err) { next(err); }
};

const stats = async (req, res, next) => {
  try {
    const rows = (await db.query('SELECT * FROM user_statistics ORDER BY total_views DESC NULLS LAST')).rows;
    const totals = (await db.query(
      "SELECT COUNT(*) FILTER (WHERE status='published') AS published_posts, COUNT(*) AS total_posts, COALESCE(SUM(view_count),0) AS total_views FROM posts"
    )).rows[0];
    res.json(successResponse({ users: rows, totals }));
  } catch (err) { next(err); }
};

module.exports = { list, getById, update, remove, stats };
