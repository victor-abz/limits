"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
const crypto_1 = __importDefault(require("crypto"));
class RateLimiter {
    strategy;
    message = 'Too Many Requests';
    hashAlgorithm = 'sha256';
    config;
    constructor(config) {
        this.config = config;
    }
    hashIdentifier(identifier) {
        const hash = crypto_1.default.createHash(this.hashAlgorithm);
        hash.update(identifier);
        return hash.digest('hex');
    }
    async refillToken(identifier, userDetails) {
        return this.strategy.refillToken(identifier, userDetails);
    }
    async consumeToken(identifier, userDetails) {
        return this.strategy.consumeToken(identifier, userDetails);
    }
    async middleware(req, res, next) {
        // const keyGenerator = this.config.keyGenerator || ((req) => req.ip);
        // const userDetails: userDetails = await keyGenerator(req, res);
        const keyGenerator = this.config.keyGenerator || this.defaultKeyGenerator;
        const userDetails = await keyGenerator(req, res);
        const hashedIdentifier = await this.hashIdentifier(`${userDetails.identifier}`);
        await this.refillToken(hashedIdentifier, userDetails);
        const consumeToken = await this.consumeToken(hashedIdentifier, userDetails);
        if (consumeToken === true) {
            next();
        }
        else {
            return res.status(429).json({ status: 429, message: this.message });
        }
    }
    defaultKeyGenerator(req) {
        const defaultUserDetails = {
            identifier: req.ip,
            maxRequestsPerTimeWindow: process.env.DEF_MAX_REQ_PER_USER_TIMEWINDOW || 10,
            maxRequestsPerUserPerMonth: process.env.DEF_MAX_REQ_PER_USER_MONTH || 100,
        };
        return Promise.resolve(defaultUserDetails);
    }
}
exports.RateLimiter = RateLimiter;
//# sourceMappingURL=Limiter.js.map