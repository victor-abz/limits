import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { StorageOptions } from './Storage/types/storage-options.types';

export interface UserDetails {
  identifier: string;
  maxRequestsPerTimeWindow: number;
  maxRequestsPerUserPerMonth: number;
}

export type RateLimiterConfigOptions = {
  timeWindow: number | 'second' | 'sec' | 'minute' | 'min' | 'hour' | 'hr' | 'day';
  maxRequestsAcrossSystem: number;
  storage: StorageOptions;
  message?: string;
  keyGenerator?: (req: Request, res: Response) => Promise<UserDetails>;
};

export interface RateLimiterStrategy {
  refillToken(identifier: string, userDetails: UserDetails): Promise<void>;
  consumeToken(identifier: string, userDetails: UserDetails): Promise<boolean>;
}

export class RateLimiter {
  protected strategy: RateLimiterStrategy;
  protected message = 'Too Many Requests';
  protected hashAlgorithm = 'sha256';
  protected config: RateLimiterConfigOptions;

  constructor(config: RateLimiterConfigOptions) {
    this.config = config;
  }

  private hashIdentifier(identifier: string): string {
    const hash = crypto.createHash(this.hashAlgorithm);
    hash.update(identifier);
    return hash.digest('hex');
  }

  async refillToken(identifier: string, userDetails: UserDetails): Promise<void> {
    return this.strategy.refillToken(identifier, userDetails);
  }

  async consumeToken(identifier: string, userDetails: UserDetails): Promise<boolean> {
    return this.strategy.consumeToken(identifier, userDetails);
  }

  async middleware(req: Request, res: Response, next: NextFunction) {
    // const keyGenerator = this.config.keyGenerator || ((req) => req.ip);
    // const userDetails: userDetails = await keyGenerator(req, res);
    const keyGenerator = this.config.keyGenerator || this.defaultKeyGenerator;
    const userDetails: UserDetails = await keyGenerator(req, res);

    const hashedIdentifier = await this.hashIdentifier(`${userDetails.identifier}`);

    await this.refillToken(hashedIdentifier, userDetails);

    const consumeToken = await this.consumeToken(hashedIdentifier, userDetails);

    if (consumeToken === true) {
      next();
    } else {
      return res.status(429).json({ status: 429, message: this.message });
    }
  }

  private defaultKeyGenerator(req: Request): Promise<UserDetails> {
    const defaultUserDetails: UserDetails = {
      identifier: req.ip!,
      maxRequestsPerTimeWindow: 10,
      maxRequestsPerUserPerMonth: 100,
    };

    return Promise.resolve(defaultUserDetails);
  }
}
