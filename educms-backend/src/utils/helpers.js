const slugify = require('slugify');
const crypto = require('crypto');

const generateSlug = (text) => slugify(text, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });

const generateUniqueSlug = async (text, checkExistsCallback) => {
  const slug = generateSlug(text);
  const exists = await checkExistsCallback(slug);
  if (exists) return `${slug}-${crypto.randomBytes(4).toString('hex')}`;
  return slug;
};

const paginate = (page = 1, limit = 10) => {
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  if (limit > 100) limit = 100;
  if (limit < 1) limit = 10;
  if (page < 1) page = 1;
  return { page, limit, offset: (page - 1) * limit };
};

const getPaginationMeta = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    currentPage: parseInt(page),
    totalPages,
    totalItems,
    itemsPerPage: parseInt(limit),
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

const successResponse = (data, message = 'Success') => ({ success: true, message, data });
const errorResponse = (message, errors = null) => {
  const r = { success: false, message };
  if (errors) r.errors = errors;
  return r;
};

const calculateReadingTime = (text) => {
  const wordCount = text.trim().split(/\s+/).length;
  return Math.max(Math.ceil(wordCount / 200), 1);
};

const generateToken = (length = 32) => crypto.randomBytes(length).toString('hex');

const extractExcerpt = (content, length = 200) => {
  const text = content.replace(/<[^>]*>/g, '');
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

module.exports = {
  generateSlug,
  generateUniqueSlug,
  paginate,
  getPaginationMeta,
  successResponse,
  errorResponse,
  calculateReadingTime,
  generateToken,
  extractExcerpt,
  isValidEmail,
};
