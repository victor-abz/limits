// RateLimiter.ts
import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { StorageOptions } from './Storage/types/storage-options.types';

export type RateLimiterConfigOptions = {
  timeWindow: number | 'second' | 'sec' | 'minute' | 'min' | 'hour' | 'hr' | 'day';
  maxRequestsPerTimeWindow: number;
  maxRequestsPerMonth: number;
  maxRequestsAcrossSystem: number;
  message?: string;
  storage: StorageOptions;
};

export interface RateLimiterStrategy {
  refillToken(ip: string): Promise<void>;
  consumeToken(ip: string): Promise<boolean>;
}

export class RateLimiter {
  protected strategy: RateLimiterStrategy;
  protected message = 'Too Many Requests';
  protected hashAlgorithm = 'sha256';

  private hashIpAddress(ipAddress: string): string {
    const hash = crypto.createHash(this.hashAlgorithm);
    hash.update(ipAddress);
    return hash.digest('hex');
  }

  async refillToken(ip: string): Promise<void> {
    return this.strategy.refillToken(ip);
  }

  async consumeToken(ip: string): Promise<boolean> {
    return this.strategy.consumeToken(ip);
  }

  async middleware(req: Request, res: Response, next: NextFunction) {
    const ipAddress = req.header('x-forwarded-for') || req.socket.remoteAddress;
    const hashedIp = this.hashIpAddress(`${ipAddress}`);

    await this.refillToken(`${hashedIp}`);

    const consumeToken = await this.consumeToken(`${hashedIp}`);

    if (consumeToken === true) {
      next();
    } else {
      return res.status(429).json({ status: 429, message: this.message });
    }
  }
}
