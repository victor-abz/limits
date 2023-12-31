import { StorageStrategy } from '../storage.interface';
import { RedisOptions } from '../types/storage-options.types';
export declare class RedisStorageStrategy implements StorageStrategy {
    private storage;
    private expireTime;
    constructor(redisOptions?: RedisOptions, expireTime?: number);
    get(ip: string): Promise<string | number | null | undefined>;
    set(ip: string, capacity: number): Promise<void>;
    has(ip: string): Promise<boolean>;
}
//# sourceMappingURL=redis.storage.d.ts.map