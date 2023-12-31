import { StorageStrategy } from '../storage.interface';
export declare class LocalStorageStrategy implements StorageStrategy {
    private storage;
    constructor();
    get(ip: string): Promise<string | number | null | undefined>;
    set(ip: string, capacity: number): void;
    has(ip: string): Promise<boolean>;
}
//# sourceMappingURL=local-storage.strategy.d.ts.map