"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Storage = void 0;
// storage.ts
const local_storage_strategy_1 = require("./Strategies/local-storage.strategy");
const redis_storage_1 = require("./Strategies/redis.storage");
class Storage {
    storageStrategy;
    constructor({ strategy, redisOptions }, expireTime) {
        if (strategy === 'redis') {
            this.storageStrategy = new redis_storage_1.RedisStorageStrategy(redisOptions, expireTime);
        }
        else {
            this.storageStrategy = new local_storage_strategy_1.LocalStorageStrategy();
        }
    }
    get(ip) {
        return this.storageStrategy.get(ip);
    }
    set(ip, capacity) {
        this.storageStrategy.set(ip, capacity);
    }
    has(ip) {
        return this.storageStrategy.has(ip);
    }
}
exports.Storage = Storage;
//# sourceMappingURL=Storage.js.map