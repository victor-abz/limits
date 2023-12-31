"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenBucketStrategy = void 0;
const Storage_1 = require("./Storage/Storage");
class TokenBucketStrategy {
    maxRequestsAcrossSystem;
    storage;
    maxRequestsPerTimeWindow;
    timeWindow;
    lastRefillTime;
    monthlyRequestKeyPrefix = 'monthlyRequest_';
    constructor(timeWindow, storage, maxRequestsAcrossSystem) {
        this.maxRequestsAcrossSystem = maxRequestsAcrossSystem;
        this.storage = new Storage_1.Storage(storage, timeWindow);
        this.timeWindow = timeWindow;
        this.lastRefillTime = Date.now();
    }
    getCurrentMonthKey() {
        const now = new Date();
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    }
    async refillToken(userIdentifier, userDetails) {
        const now = Date.now();
        const elapsedTime = now - this.lastRefillTime;
        const tokensToAdd = (elapsedTime / this.timeWindow) * 10;
        const userIdentifierExists = await this.storage.has(userIdentifier);
        let newTokens;
        if (userIdentifierExists) {
            const currentTokens = (await this.storage.get(userIdentifier)) || 0;
            newTokens = Math.min(+currentTokens + Math.floor(tokensToAdd), userDetails.maxRequestsPerTimeWindow);
        }
        else {
            newTokens = +userDetails.maxRequestsPerTimeWindow;
        }
        if (newTokens === userDetails.maxRequestsPerTimeWindow) {
            this.storage.set(userIdentifier, newTokens);
            this.lastRefillTime = now;
        }
        const monthlyKey = this.monthlyRequestKeyPrefix + this.getCurrentMonthKey() + `_${userIdentifier}`;
        const monthlyRequests = (await this.storage.get(monthlyKey)) || 0;
        this.storage.set(monthlyKey, monthlyRequests + 1);
    }
    async consumeToken(userIdentifier, userDetails) {
        const systemKey = 'systemRequests';
        const systemRequests = (await this.storage.get(systemKey)) || 0;
        if (systemRequests > this.maxRequestsAcrossSystem) {
            return false; // Hard throttling for the whole system
        }
        const monthlyKey = this.monthlyRequestKeyPrefix + this.getCurrentMonthKey() + `_${userIdentifier}`;
        const monthlyRequests = (await this.storage.get(monthlyKey)) || 0;
        if (monthlyRequests > userDetails.maxRequestsPerUserPerMonth) {
            return false; // Hard throttling for the user per month
        }
        const userIdentifierExists = await this.storage.has(userIdentifier);
        let currentTokens;
        if (userIdentifierExists) {
            currentTokens = (await this.storage.get(userIdentifier));
        }
        else {
            currentTokens = userDetails.maxRequestsPerTimeWindow;
        }
        currentTokens = +currentTokens;
        if (currentTokens > 0) {
            this.storage.set(systemKey, systemRequests + 1);
            this.storage.set(userIdentifier, currentTokens - 1);
            return true;
        }
        else {
            // TO-DO: Implement soft throttling for eligible customers
            return false;
        }
    }
}
exports.TokenBucketStrategy = TokenBucketStrategy;
//# sourceMappingURL=TokenBucketStrategy.js.map