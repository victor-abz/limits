"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv = __importStar(require("dotenv"));
const express_1 = __importDefault(require("express"));
const limiter_1 = require("./limiter");
dotenv.config();
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// A global limit using the whole Express App
const rateLimitConfig = {
    timeWindow: process.env.TIME_WINDOW || 'sec', // or provide a specific time in milliseconds
    maxRequestsAcrossSystem: process.env.MAX_REQUESTS_ACROSS_SYSTEM || 1000,
    keyGenerator: async (req) => {
        // Implement your logic to get the rate limits from the configuration or any other source.
        return {
            identifier: req.body.username,
            maxRequestsPerTimeWindow: req.body.maxRequestsPerTimeWindow,
            maxRequestsPerUserPerMonth: req.body.maxRequestsPerUserPerMonth,
        };
    },
    // message: 'You have reached your limit, please access after period',
    storage: {
        strategy: 'local', // Change to 'redis'for "distributed setup - a cluster of servers.
    },
};
// Create a TokenBucket rate limiter with the specified configuration
const rateLimiter = new limiter_1.TokenBucket(rateLimitConfig);
// Apply global limiter
app.use((req, res, next) => {
    rateLimiter.middleware(req, res, next);
});
app.get('/', async (req, res) => {
    return res.status(200).send({
        message: 'Welcome to the Limiter!',
    });
});
app.post('/send-notification', async (req, res) => {
    console.log(req.body);
    // Handle Notification Handler
    return res.status(200).send({
        message: 'Notification Sent',
    });
});
const PORT = 3000;
try {
    app.listen(PORT, () => {
        console.log(`Connected successfully on port ${PORT}`);
    });
}
catch (error) {
    console.error(`Error occured: ${error.message}`);
}
exports.default = app;
//# sourceMappingURL=index.js.map