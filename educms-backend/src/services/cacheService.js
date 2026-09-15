const { cache } = require('../config/redis');

const POST_LIST_TTL = 300;
const postListKey = (query) => `posts:list:${JSON.stringify(query)}`;
const postKey = (slugOrId) => `posts:item:${slugOrId}`;

const getCachedPostList = (query) => cache.get(postListKey(query));
const setCachedPostList = (query, data) => cache.set(postListKey(query), data, POST_LIST_TTL);
const invalidatePostCache = async () => {
  await cache.delPattern('posts:list:*');
  await cache.delPattern('posts:item:*');
};

module.exports = { getCachedPostList, setCachedPostList, invalidatePostCache, postKey };
