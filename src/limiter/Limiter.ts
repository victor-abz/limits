import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { StorageOptions } from './Storage/types/storage-options.types';

export type RateLimiterConfigOptions = {
  timeWindow: number | 'second' | 'sec' | 'minute' | 'min' | 'hour' | 'hr' | 'day';
  maxRequestsPerTimeWindow: number;
  maxRequestsPerUserPerMonth: number;
  maxRequestsAcrossSystem: number;
  message?: string;
  storage: StorageOptions;
  keyGenerator?: (req: Request, res: Response) => string;
};

export interface RateLimiterStrategy {
  refillToken(identifier: string): Promise<void>;
  consumeToken(identifier: string): Promise<boolean>;
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

  async refillToken(identifier: string): Promise<void> {
    return this.strategy.refillToken(identifier);
  }

  async consumeToken(identifier: string): Promise<boolean> {
    return this.strategy.consumeToken(identifier);
  }

  async middleware(req: Request, res: Response, next: NextFunction) {
    const keyGenerator = this.config.keyGenerator || ((req) => req.ip);
    const identifier = keyGenerator(req, res);
    const hashedIdentifier = this.hashIdentifier(`${identifier}`);

    await this.refillToken(`${hashedIdentifier}`);

    const consumeToken = await this.consumeToken(`${hashedIdentifier}`);

    if (consumeToken === true) {
      next();
    } else {
      return res.status(429).json({ status: 429, message: this.message });
    }
  }
}
