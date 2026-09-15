const fs = require('fs');
const Media = require('../models/Media');
const { paginate, getPaginationMeta, successResponse } = require('../utils/helpers');

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const record = await Media.create({
      filename: req.file.filename,
      original_name: req.file.originalname,
      file_path: req.file.path,
      file_type: req.file.mimetype.split('/')[0],
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      uploaded_by: req.user.user_id,
      alt_text: req.body.alt_text,
      caption: req.body.caption,
    });
    res.status(201).json(successResponse(record, 'File uploaded'));
  } catch (err) { next(err); }
};

const list = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);
    const { rows, total } = await Media.list({ page, limit, offset });
    res.json(successResponse({ media: rows, pagination: getPaginationMeta(total, page, limit) }));
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const record = await Media.remove(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Media not found' });
    fs.unlink(record.file_path, () => {});
    res.json(successResponse(null, 'Media deleted'));
  } catch (err) { next(err); }
};

module.exports = { uploadFile, list, remove };
