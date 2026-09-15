const Comment = require('../models/Comment');
const db = require('../config/database');
const { paginate, getPaginationMeta, successResponse } = require('../utils/helpers');

const getForPost = async (req, res, next) => {
  try {
    const rows = await Comment.listForPost(req.params.postId);
    res.json(successResponse(rows));
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const post = (await db.query('SELECT post_id, allow_comments FROM posts WHERE post_id = $1', [req.params.postId])).rows[0];
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (!post.allow_comments) return res.status(400).json({ success: false, message: 'Comments disabled for this post' });
    const comment = await Comment.create({
      post_id: req.params.postId,
      user_id: req.user ? req.user.user_id : null,
      parent_id: req.body.parent_id,
      content: req.body.content,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
    });
    res.status(201).json(successResponse(comment, 'Comment submitted for moderation'));
  } catch (err) { next(err); }
};

const listAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);
    const { rows, total } = await Comment.listAll({ status: req.query.status, page, limit, offset });
    res.json(successResponse({ comments: rows, pagination: getPaginationMeta(total, page, limit) }));
  } catch (err) { next(err); }
};

const moderate = async (req, res, next) => {
  try {
    const updated = await Comment.setStatus(req.params.id, req.body.status);
    if (!updated) return res.status(404).json({ success: false, message: 'Comment not found' });
    res.json(successResponse(updated, 'Comment updated'));
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    if (!(await Comment.remove(req.params.id))) return res.status(404).json({ success: false, message: 'Comment not found' });
    res.json(successResponse(null, 'Comment deleted'));
  } catch (err) { next(err); }
};

module.exports = { getForPost, create, listAll, moderate, remove };
