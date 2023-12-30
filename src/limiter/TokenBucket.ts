import { RateLimiter, RateLimiterConfigOptions } from './Limiter';
import { TokenBucketStrategy } from './TokenBucketStrategy';

export class TokenBucket extends RateLimiter {
  constructor({
    timeWindow,
    maxRequestsPerTimeWindow,
    maxRequestsPerUserPerMonth,
    maxRequestsAcrossSystem,
    message,
    storage,
    keyGenerator,
  }: RateLimiterConfigOptions) {
    super({
      timeWindow,
      maxRequestsPerTimeWindow,
      maxRequestsPerUserPerMonth,
      maxRequestsAcrossSystem,
      message,
      storage,
      keyGenerator,
    });

    this.message = message ? message : 'Too Many Requests';
    if (typeof timeWindow === 'string') {
      switch (timeWindow) {
        case 'sec':
        case 'second':
          timeWindow = 1000;
          break;
        case 'min':
        case 'minute':
          timeWindow = 60 * 1000;
          break;
        case 'hr':
        case 'hour':
          timeWindow = 60 * 60 * 1000;
          break;
        case 'day':
          timeWindow = 24 * 60 * 60 * 1000;
          break;
        default:
          throw new Error('Invalid timeWindow: ' + timeWindow);
      }
    }

    this.strategy = new TokenBucketStrategy(
      this.config.maxRequestsPerTimeWindow,
      this.config.timeWindow as number,
      this.config.storage,
      this.config.maxRequestsPerUserPerMonth,
      this.config.maxRequestsAcrossSystem,
    );
  }
}
