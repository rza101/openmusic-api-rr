/* eslint-disable no-underscore-dangle */
const redis = require('redis');

class CacheService {
    constructor() {
        this._redisClient = redis.createClient({
            socket: {
                host: process.env.REDIS_SERVER,
            },
        });
        this._redisClient.on('error', (error) => {
            console.error(error);
        });
        this._redisClient.connect();
    }

    async setItem(key, value, expireInSeconds = 60 * 30) {
        await this._redisClient.set(key, value, {
            EX: expireInSeconds,
        });
    }

    async getItem(key) {
        return this._redisClient.get(key);
    }

    deleteItem(key) {
        return this._redisClient.del(key);
    }
}

module.exports = CacheService;
