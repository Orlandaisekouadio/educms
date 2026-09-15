const redis = require('redis');
require('dotenv').config();

let redisClient = null;

if (process.env.REDIS_ENABLED === 'true') {
  redisClient = redis.createClient({
    socket: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT) || 6379,
    },
    password: process.env.REDIS_PASSWORD || undefined,
    database: parseInt(process.env.REDIS_DB) || 0,
  });

  redisClient.on('connect', () => console.log('Redis connected successfully'));
  redisClient.on('error', (err) => console.error('Redis connection error:', err.message));
  redisClient.on('ready', () => console.log('Redis client ready'));

  (async () => {
    try {
      await redisClient.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error.message);
    }
  })();
}

const cache = {
  get: async (key) => {
    if (!redisClient) return null;
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis GET error:', error.message);
      return null;
    }
  },
  set: async (key, value, expirationInSeconds = 3600) => {
    if (!redisClient) return false;
    try {
      await redisClient.setEx(key, expirationInSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis SET error:', error.message);
      return false;
    }
  },
  del: async (key) => {
    if (!redisClient) return false;
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error.message);
      return false;
    }
  },
  delPattern: async (pattern) => {
    if (!redisClient) return false;
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) await redisClient.del(keys);
      return true;
    } catch (error) {
      console.error('Redis DEL pattern error:', error.message);
      return false;
    }
  },
  exists: async (key) => {
    if (!redisClient) return false;
    try {
      return (await redisClient.exists(key)) === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error.message);
      return false;
    }
  },
  flush: async () => {
    if (!redisClient) return false;
    try {
      await redisClient.flushDb();
      return true;
    } catch (error) {
      console.error('Redis FLUSH error:', error.message);
      return false;
    }
  },
};

module.exports = { redisClient, cache };
