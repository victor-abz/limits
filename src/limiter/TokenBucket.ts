import { RateLimiter, RateLimiterConfigOptions } from './Limiter';
import { TokenBucketStrategy } from './TokenBucketStrategy';

export class TokenBucket extends RateLimiter {
  constructor(config: RateLimiterConfigOptions) {
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

    this.strategy = new TokenBucketStrategy(
      this.config.maxRequestsPerTimeWindow,
      this.config.timeWindow as number,
      this.config.storage,
      this.config.maxRequestsPerUserPerMonth,
      this.config.maxRequestsAcrossSystem,
    );
  }
}
