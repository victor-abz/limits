import { UserDetails } from './Limiter';
import { StorageOptions } from './Storage/types/storage-options.types';
export declare class TokenBucketStrategy {
    private maxRequestsAcrossSystem;
    private storage;
    private maxRequestsPerTimeWindow;
    private timeWindow;
    private lastRefillTime;
    private monthlyRequestKeyPrefix;
    constructor(timeWindow: number, storage: StorageOptions, maxRequestsAcrossSystem: number);
    private getCurrentMonthKey;
    refillToken(userIdentifier: string, userDetails: UserDetails): Promise<void>;
    consumeToken(userIdentifier: string, userDetails: UserDetails): Promise<boolean>;
}
//# sourceMappingURL=TokenBucketStrategy.d.ts.map