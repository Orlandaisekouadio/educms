const Category = require('../models/Category');
const Tag = require('../models/Tag');
const { successResponse, generateSlug } = require('../utils/helpers');

const listCategories = async (req, res, next) => {
  try { res.json(successResponse(await Category.list())); } catch (err) { next(err); }
};
const createCategory = async (req, res, next) => {
  try {
    const { name, description, parent_id, display_order } = req.body;
    const slug = generateSlug(name);
    if (await Category.findBySlug(slug)) return res.status(409).json({ success: false, message: 'Category slug already exists' });
    const cat = await Category.create({ name, slug, description, parent_id, display_order });
    res.status(201).json(successResponse(cat, 'Category created'));
  } catch (err) { next(err); }
};
const updateCategory = async (req, res, next) => {
  try {
    const updated = await Category.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json(successResponse(updated, 'Category updated'));
  } catch (err) { next(err); }
};
const deleteCategory = async (req, res, next) => {
  try {
    if (!(await Category.remove(req.params.id))) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json(successResponse(null, 'Category deleted'));
  } catch (err) { next(err); }
};

const listTags = async (req, res, next) => {
  try { res.json(successResponse(await Tag.list())); } catch (err) { next(err); }
};
const createTag = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const slug = generateSlug(name);
    if (await Tag.findBySlug(slug)) return res.status(409).json({ success: false, message: 'Tag already exists' });
    const tag = await Tag.create({ name, slug, description });
    res.status(201).json(successResponse(tag, 'Tag created'));
  } catch (err) { next(err); }
};
const deleteTag = async (req, res, next) => {
  try {
    if (!(await Tag.remove(req.params.id))) return res.status(404).json({ success: false, message: 'Tag not found' });
    res.json(successResponse(null, 'Tag deleted'));
  } catch (err) { next(err); }
};

module.exports = { listCategories, createCategory, updateCategory, deleteCategory, listTags, createTag, deleteTag };
