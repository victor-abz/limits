"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageStrategy = void 0;
class LocalStorageStrategy {
    storage;
    constructor() {
        this.storage = new Map();
    }
    async get(ip) {
        return this.storage.get(ip);
    }
    set(ip, capacity) {
        this.storage.set(ip, capacity);
    }
    async has(ip) {
        return this.storage.has(ip);
    }
}
exports.LocalStorageStrategy = LocalStorageStrategy;
//# sourceMappingURL=local-storage.strategy.js.map