const db = require('../config/database');
const Post = require('../models/Post');
const Tag = require('../models/Tag');
const { paginate, getPaginationMeta, successResponse, generateUniqueSlug, calculateReadingTime, extractExcerpt } = require('../utils/helpers');
const { getCachedPostList, setCachedPostList, invalidatePostCache, postKey } = require('../services/cacheService');
const { cache } = require('../config/redis');
const { logActivity } = require('../models/Media');

const list = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query.page, req.query.limit || process.env.DEFAULT_PAGE_SIZE);
    const params = { ...req.query, page, limit, offset };
    if (!req.user && !req.query.status) params.status = 'published';
    const cached = await getCachedPostList(params);
    if (cached) return res.json(successResponse(cached));
    const { rows, total } = await Post.list(params);
    const data = { posts: rows, pagination: getPaginationMeta(total, page, limit) };
    await setCachedPostList(params, data);
    res.json(successResponse(data));
  } catch (err) { next(err); }
};

const getBySlug = async (req, res, next) => {
  try {
    const key = postKey(req.params.slug);
    const cached = await cache.get(key);
    if (cached) return res.json(successResponse(cached));
    const post = await Post.findBySlug(req.params.slug);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.status !== 'published' && (!req.user || !['admin', 'editor'].includes(req.user.role))) {
      if (!req.user || post.author_id !== req.user.user_id) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
    }
    await Post.incrementViews(post.post_id);
    post.view_count += 1;
    await cache.set(key, post, 600);
    res.json(successResponse(post));
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { title, content, category_id, status = 'draft', excerpt, meta_title, meta_description, meta_keywords, is_featured, allow_comments, tag_ids } = req.body;
    const slug = await generateUniqueSlug(title, Post.slugExists);
    const published_at = status === 'published' ? new Date() : null;
    const result = await db.transaction(async (client) => {
      const r = await client.query(
        `INSERT INTO posts (title, slug, content, excerpt, author_id, category_id, status, published_at, meta_title, meta_description, meta_keywords, is_featured, allow_comments, reading_time)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
        [title, slug, content, excerpt || extractExcerpt(content), req.user.user_id, category_id || null, status, published_at,
         meta_title || null, meta_description || null, meta_keywords || null, !!is_featured, allow_comments !== false, calculateReadingTime(content)]
      );
      await Tag.setPostTags(client, r.rows[0].post_id, tag_ids);
      return r.rows[0];
    });
    await invalidatePostCache();
    await logActivity({ user_id: req.user.user_id, action: 'post.create', entity_type: 'post', entity_id: result.post_id, description: `Created post ${title}`, ip_address: req.ip, user_agent: req.get('user-agent') });
    res.status(201).json(successResponse(result, 'Post created'));
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const existing = await Post.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Post not found' });
    const canEdit = ['admin', 'editor'].includes(req.user.role) || existing.author_id === req.user.user_id;
    if (!canEdit) return res.status(403).json({ success: false, message: 'Forbidden' });

    const { title, content, category_id, status, excerpt, meta_title, meta_description, meta_keywords, is_featured, allow_comments, tag_ids } = req.body;
    const fields = {};
    if (title) fields.title = title;
    if (content) { fields.content = content; fields.reading_time = calculateReadingTime(content); }
    if (category_id !== undefined) fields.category_id = category_id;
    if (excerpt !== undefined) fields.excerpt = excerpt;
    if (meta_title !== undefined) fields.meta_title = meta_title;
    if (meta_description !== undefined) fields.meta_description = meta_description;
    if (meta_keywords !== undefined) fields.meta_keywords = meta_keywords;
    if (is_featured !== undefined) fields.is_featured = !!is_featured;
    if (allow_comments !== undefined) fields.allow_comments = !!allow_comments;
    if (status) {
      fields.status = status;
      fields.published_at = status === 'published' && !existing.published_at ? new Date() : existing.published_at;
    }

    const updated = await db.transaction(async (client) => {
      const keys = Object.keys(fields);
      let row = existing;
      if (keys.length) {
        const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
        row = (await client.query(`UPDATE posts SET ${sets} WHERE post_id = $1 RETURNING *`, [req.params.id, ...Object.values(fields)])).rows[0];
      }
      if (tag_ids !== undefined) await Tag.setPostTags(client, req.params.id, tag_ids);
      return row;
    });
    await invalidatePostCache();
    res.json(successResponse(updated, 'Post updated'));
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const existing = await Post.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Post not found' });
    const canDelete = ['admin', 'editor'].includes(req.user.role) || existing.author_id === req.user.user_id;
    if (!canDelete) return res.status(403).json({ success: false, message: 'Forbidden' });
    await db.query('DELETE FROM posts WHERE post_id = $1', [req.params.id]);
    await invalidatePostCache();
    res.json(successResponse(null, 'Post deleted'));
  } catch (err) { next(err); }
};

const like = async (req, res, next) => {
  try {
    const result = await Post.incrementLikes(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Post not found' });
    await invalidatePostCache();
    res.json(successResponse(result));
  } catch (err) { next(err); }
};

const stats = async (req, res, next) => {
  try {
    const rows = (await db.query('SELECT * FROM post_statistics ORDER BY post_id DESC LIMIT 100')).rows;
    res.json(successResponse(rows));
  } catch (err) { next(err); }
};

module.exports = { list, getBySlug, create, update, remove, like, stats };
