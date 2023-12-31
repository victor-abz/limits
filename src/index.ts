import bodyParser from 'body-parser';
import express, { Application, Request, Response } from 'express';
import { RateLimiterConfigOptions, TokenBucket } from './limiter';

const app: Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// A global limit using the whole Express App
const rateLimitConfig: RateLimiterConfigOptions = {
  timeWindow: 8000, // or provide a specific time in milliseconds
  maxRequestsAcrossSystem: 10,
  keyGenerator: async (req: Request) => {
    // Implement your logic to get the rate limits from the configuration or any other source.
    return {
      identifier: req.body.username,
      maxRequestsPerTimeWindow: 2,
      maxRequestsPerUserPerMonth: 5,
    };
  },
  // message: 'You have reached your limit, please access after period',
  storage: {
    strategy: 'local', // Change to 'redis'for "distributed setup - a cluster of servers.
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
  console.error(`Error occured: ${error.message}`);
}
