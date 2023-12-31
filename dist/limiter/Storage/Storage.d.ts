import { StorageOptions } from './types/storage-options.types';
export declare class Storage {
    private storageStrategy;
    constructor({ strategy, redisOptions }: StorageOptions, expireTime: number);
    get(ip: string): Promise<string | number | null | undefined>;
    set(ip: string, capacity: number): void;
    has(ip: string): Promise<boolean>;
}
//# sourceMappingURL=Storage.d.ts.map