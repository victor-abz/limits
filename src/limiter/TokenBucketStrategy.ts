import { Storage } from './Storage/Storage';
import { StorageStrategy } from './Storage/storage.interface';
import { StorageOptions } from './Storage/types/storage-options.types';

export class TokenBucketStrategy {
  private storage: StorageStrategy;
  private capacity: number;
  private timeWindow: number;
  private lastRefillTime: number;
  private monthlyRequestKeyPrefix = 'monthlyRequest_';

  constructor(
    capacity: number,
    timeWindow: number,
    storage: StorageOptions,
    private maxRequestsAcrossSystem: number,
    private maxRequestsPerMonth: number,
  ) {
    this.storage = new Storage(storage, timeWindow);
    this.capacity = capacity;
    this.timeWindow = timeWindow;
    this.lastRefillTime = Date.now();
  }

  async refillToken(ip: string): Promise<void> {
    const now = Date.now();

    const elapsedTime = now - this.lastRefillTime;
    const tokensToAdd = (elapsedTime / this.timeWindow) * 10;

    const ipExists = await this.storage.has(ip);
    let newTokens: number;

    if (ipExists) {
      const currentTokens = ((await this.storage.get(ip)) as number) || 0;
      newTokens = Math.min(+currentTokens + Math.floor(tokensToAdd), this.capacity);
    } else {
      newTokens = +this.capacity;
    }

    if (newTokens === this.capacity) {
      this.storage.set(ip, newTokens);
      this.lastRefillTime = now;
    }

    const monthlyKey = this.monthlyRequestKeyPrefix + new Date().toISOString().substr(0, 7);
    const monthlyRequests = ((await this.storage.get(monthlyKey)) as number) || 0;
    this.storage.set(monthlyKey, monthlyRequests + 1);
  }

  async consumeToken(ip: string): Promise<boolean> {
    const systemKey = 'systemRequests';
    const systemRequests = ((await this.storage.get(systemKey)) as number) || 0;
    if (systemRequests >= this.maxRequestsAcrossSystem) {
      return false; // Hard throttling for the whole system
    }

    const monthlyKey = this.monthlyRequestKeyPrefix + new Date().toISOString().substr(0, 7);
    const monthlyRequests = ((await this.storage.get(monthlyKey)) as number) || 0;
    if (monthlyRequests >= this.maxRequestsPerMonth) {
      return false; // Hard throttling for the month
    }

    const ipExists = await this.storage.has(ip);
    let currentTokens: number;

    if (ipExists) {
      currentTokens = (await this.storage.get(ip)) as number;
    } else {
      currentTokens = this.capacity;
    }

    currentTokens = +currentTokens;

    if (currentTokens > 0) {
      this.storage.set(systemKey, systemRequests + 1);
      this.storage.set(ip, currentTokens - 1);
      return true;
    } else {
      // TO-DO: Implement soft throttling for eligible customers
      return false;
    }
  }
}
