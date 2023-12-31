"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenBucket = void 0;
const Limiter_1 = require("./Limiter");
const TokenBucketStrategy_1 = require("./TokenBucketStrategy");
class TokenBucket extends Limiter_1.RateLimiter {
    constructor(config) {
        super(config);
        this.message = config.message || 'Too Many Requests';
        if (typeof config.timeWindow === 'string') {
            switch (config.timeWindow) {
                case 'sec':
                case 'second':
                    config.timeWindow = 1000;
                    break;
                case 'min':
                case 'minute':
                    config.timeWindow = 60 * 1000;
                    break;
                case 'hr':
                case 'hour':
                    config.timeWindow = 60 * 60 * 1000;
                    break;
                case 'day':
                    config.timeWindow = 24 * 60 * 60 * 1000;
                    break;
                default:
                    throw new Error('Invalid timeWindow: ' + config.timeWindow);
            }
        }
        this.strategy = new TokenBucketStrategy_1.TokenBucketStrategy(this.config.timeWindow, this.config.storage, this.config.maxRequestsAcrossSystem);
    }
}
exports.TokenBucket = TokenBucket;
//# sourceMappingURL=TokenBucket.js.map