"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisStorageStrategy = void 0;
const ioredis_1 = require("ioredis");
class RedisStorageStrategy {
    storage;
    expireTime;
    constructor(redisOptions, expireTime) {
        this.expireTime = expireTime || 0;
        this.storage = new ioredis_1.Redis({
            host: redisOptions?.host || '127.0.0.1',
            port: redisOptions?.port || 6379,
        });
    }
    async get(ip) {
        return this.storage.get(ip);
    }
    async set(ip, capacity) {
        const ipExists = await this.has(ip);
        if (ipExists) {
            await this.storage.set(ip, capacity, 'KEEPTTL');
        }
        else {
            await this.storage.set(ip, capacity, 'PX', this.expireTime);
        }
    }
    async has(ip) {
        const result = await this.storage.exists(ip);
        if (result === 1) {
            return true;
        }
        else {
            return false;
        }
    }
}
exports.RedisStorageStrategy = RedisStorageStrategy;
//# sourceMappingURL=redis.storage.js.map