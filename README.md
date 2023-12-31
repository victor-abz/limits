# Rate Limiter Explainer

## Remote Prototype:
`POST https://limits.vercel.app/send-notification`

```json
{
    "username": "user1",
    "maxRequestsPerTimeWindow":3,
    "maxRequestsPerUserPerMonth": 10
}
```

## Key Concepts

1. **Token Bucket Algorithm:**
   - Tokens are added to a user's bucket at a regular rate.
   - Users consume tokens when making requests.
   - Requests are allowed if there are tokens in the bucket; otherwise, they are delayed or rejected.

2. **Express Middleware:**
   - The rate limiter is applied as Express middleware globally.
   - Each request triggers token consumption, and if the limit is exceeded, a 429 status is returned.

3. **Configuration:**
   - Time window and maximum requests are configurable globally and per user.
   - Storage strategy (in-memory or Redis) is also configurable.

4. **Hard Throttling:**
   - The system can be globally throttled to prevent exceeding a maximum number of requests across all users.
   - Users can be individually throttled to limit their requests per month.

5. **Monthly Request Counting:**
   - Monthly request counts are tracked for each user to enforce monthly limits.


## Handling Scenarios

1. **Too Many Requests within the Same Time Window from a Client:**
   - If a client exceeds the configured maximum requests within the specified time window, subsequent requests will receive a 429 status response until the time window resets.

2. **Too Many Requests from a Specific Client on a Per-Month Basis:**
   - Monthly request counts are tracked for each client, and if a client surpasses the configured maximum requests per month, the system enforces hard throttling, rejecting further requests for the remainder of the month.

3. **Too Many Requests Across the Entire System:**
   - If the overall number of requests across the entire system surpasses the globally configured maximum, the system enforces hard throttling, rejecting further requests until the specified time window resets.

## Usage

### Installation

To install the example rate limiter, use the following npm command:

```bash
git clone https://github.com/victor-abz/limits.git
cd limits && npm install
```

### Example Usage

```ts
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import { RateLimiterConfigOptions, TimeWindow, TokenBucket } from './limiter';

dotenv.config();

const app: Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Example Rate Limiter Configuration
const rateLimitConfig: RateLimiterConfigOptions = {
  timeWindow: (process.env.TIME_WINDOW as number | TimeWindow) || 'sec', // or provide a specific time in milliseconds
  maxRequestsAcrossSystem: (process.env.MAX_REQUESTS_ACROSS_SYSTEM as unknown as number) || 1000,
  keyGenerator: async (req: Request) => {
    // Implement your logic to get the rate limits from the configuration or any other source.
    return {
      identifier: req.body.username,
      maxRequestsPerTimeWindow: req.body.maxRequestsPerTimeWindow,
      maxRequestsPerUserPerMonth: req.body.maxRequestsPerUserPerMonth,
    };
  },
  // message: 'You have reached your limit, please access after the period',
  storage: {
    strategy: 'local', // Change to 'redis' for a distributed setup - a cluster of servers.
  },
};

// Create a TokenBucket rate limiter with the specified configuration
const rateLimiter = new TokenBucket(rateLimitConfig);

// Apply global limiter
app.use((req, res, next) => {
  rateLimiter.middleware(req, res, next);
});

app.get('/', async (req: Request, res: Response): Promise<Response> => {
  return res.status(200).send({
    message: 'Hello World!',
  });
});

app.post('/send-notification', async (req: Request, res: Response): Promise<Response> => {
  console.log(req.body);
  // Handle Notification Handler
  return res.status(200).send({
    message: 'Notification Sent',
  });
});

const PORT = 3000;

try {
  app.listen(PORT, (): void => {
    console.log(`Connected successfully on port ${PORT}`);
  });
} catch (error: any) {
  console.error(`Error occurred: ${error.message}`);
}

```

### Testing
To run tests, use the following npm command:

```bash
npm test
```

## Storage strategies
### 1. Local Storage Strategy (`LocalStorageStrategy`)

- **Description:**
  - In-memory storage strategy using a JavaScript `Map`.
  - Suitable for single-server deployments or scenarios where a distributed cache is not required.

- **Implementation:**
  - `LocalStorageStrategy` class implements the `StorageStrategy` interface.
  - Uses a `Map` to store IP addresses and their corresponding capacity values.


### 2. Redis Storage Strategy (`RedisStorageStrategy`)

- **Description:**
  - Redis-based storage strategy using the ioredis library.
  - Suitable for distributed setups where multiple server instances need to share rate-limiting information.
  
- **Implementation:**
  - RedisStorageStrategy class implements the StorageStrategy interface.
  - Utilizes the ioredis library to interact with a Redis server.

## Limiter File Structure explained

###  `RateLimiter.ts`
- Defines interfaces and types used by the rate limiter.
- Implements a generic `RateLimiter` class, serving as the base for specific strategies.
- The class includes methods for token consumption, token refill, and Express middleware.

###  `TokenBucket.ts`
- Extends the `RateLimiter` class with a specific token bucket strategy.
- Converts the configured time window from string format to milliseconds.
- Initializes a `TokenBucketStrategy` instance.

### `TokenBucketStrategy.ts`
- Implements the token bucket strategy for rate limiting.
- Manages token refilling and consumption using a specified storage strategy.
- The strategy includes hard throttling at both system and user levels, with monthly and time window limits.

## Potential Enhancements

1. **Soft Throttling:**
   - Implement a mechanism for soft throttling for eligible customers when they reach their limit.

2. **Logging:**
   - Add comprehensive logging to track token consumption and refilling.

3. **Security:**
   - Ensure secure handling of user identifiers and requests.

4. **Documentation:**
   - Enhance code comments and provide comprehensive documentation for users and maintainers.

By leveraging this rate limiter, developers can protect their services from abuse by limiting the frequency of requests, ensuring fair usage, and preventing potential denial-of-service attacks.
