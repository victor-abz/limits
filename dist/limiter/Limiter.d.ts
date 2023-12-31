import { NextFunction, Request, Response } from 'express';
import { StorageOptions } from './Storage/types/storage-options.types';
export interface UserDetails {
    identifier: string;
    maxRequestsPerTimeWindow: number;
    maxRequestsPerUserPerMonth: number;
}
export type TimeWindow = 'second' | 'sec' | 'minute' | 'min' | 'hour' | 'hr' | 'day';
export type RateLimiterConfigOptions = {
    timeWindow: number | TimeWindow;
    maxRequestsAcrossSystem: number;
    storage: StorageOptions;
    message?: string;
    keyGenerator?: (req: Request, res: Response) => Promise<UserDetails>;
};
export interface RateLimiterStrategy {
    refillToken(identifier: string, userDetails: UserDetails): Promise<void>;
    consumeToken(identifier: string, userDetails: UserDetails): Promise<boolean>;
}
export declare class RateLimiter {
    protected strategy: RateLimiterStrategy;
    protected message: string;
    protected hashAlgorithm: string;
    protected config: RateLimiterConfigOptions;
    constructor(config: RateLimiterConfigOptions);
    private hashIdentifier;
    refillToken(identifier: string, userDetails: UserDetails): Promise<void>;
    consumeToken(identifier: string, userDetails: UserDetails): Promise<boolean>;
    middleware(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    private defaultKeyGenerator;
}
//# sourceMappingURL=Limiter.d.ts.map