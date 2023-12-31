import express, { Request } from 'express';
import request from 'supertest';
import { TimeWindow, TokenBucket } from '../../src/limiter';

const app = express();

const rateLimiter = new TokenBucket({
  timeWindow: (process.env.TIME_WINDOW as number | TimeWindow) || 'sec',
  maxRequestsAcrossSystem: (process.env.MAX_REQUESTS_ACROSS_SYSTEM as unknown as number) || 1000,
  keyGenerator: async (req: Request) => {
    return {
      identifier: req.body.username,
      maxRequestsPerTimeWindow: req.body.maxRequestsPerTimeWindow,
      maxRequestsPerUserPerMonth: req.body.maxRequestsPerUserPerMonth,
    };
  },
  storage: {
    strategy: 'local',
  },
});

app.use(express.json());
app.use((req, res, next) => {
  rateLimiter.middleware(req, res, next);
});

app.post('/send-notification', (req, res) => {
  res.status(200).json({ message: 'Notification Sent' });
});

describe('Rate Limiter E2E Tests', () => {
  it('should allow access to the endpoint within the rate limit', async () => {
    const response = await request(app).post('/send-notification').send({
      username: 'user1',
      maxRequestsPerTimeWindow: 3,
      maxRequestsPerUserPerMonth: 7,
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Notification Sent');
  });

  it('should return 429 status when rate limit is exceeded', async () => {
    // Exceed the rate limit
    for (let i = 0; i < 15; i++) {
      await request(app).post('/send-notification').send({
        username: 'user1',
        maxRequestsPerTimeWindow: 3,
        maxRequestsPerUserPerMonth: 7,
      });
    }

    const response = await request(app).post('/send-notification').send({
      username: 'user1',
      maxRequestsPerTimeWindow: 3,
      maxRequestsPerUserPerMonth: 7,
    });

    expect(response.status).toBe(429);
    expect(response.body.message).toBe('Too Many Requests');
  });
  let customKeyGenerator: jest.Mock;

  beforeEach(() => {
    // Mock the custom key generator function
    customKeyGenerator = jest.fn().mockImplementation((req: Request) => {
      return {
        identifier: req.body.customIdentifier,
        maxRequestsPerTimeWindow: 5,
        maxRequestsPerUserPerMonth: 50,
      };
    });
  });
  it('should handle rate limiting with custom key generator', async () => {
    const response = await request(app).post('/send-notification').send({ customIdentifier: 'test' });

    expect(response.status).toBe(429);
    expect(response.body.message).toBe('Too Many Requests');
  });

  it('should handle rate limiting with a different time window', async () => {
    const response1 = await request(app).post('/send-notification').send({
      username: 'user1',
      maxRequestsPerTimeWindow: 1,
      maxRequestsPerUserPerMonth: 10,
    });
    expect(response1.status).toBe(429);
    expect(response1.body.message).toBe('Too Many Requests');
  });
});
