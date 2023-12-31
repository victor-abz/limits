import { UserDetails } from './Limiter';
import { Storage } from './Storage/Storage';
import { StorageStrategy } from './Storage/storage.interface';
import { StorageOptions } from './Storage/types/storage-options.types';

export class TokenBucketStrategy {
  private storage: StorageStrategy;
  private maxRequestsPerTimeWindow: number;
  private timeWindow: number;
  private lastRefillTime: number;
  private monthlyRequestKeyPrefix = 'monthlyRequest_';

  constructor(
    timeWindow: number,
    storage: StorageOptions,
    private maxRequestsAcrossSystem: number,
  ) {
    this.storage = new Storage(storage, timeWindow);
    this.timeWindow = timeWindow;
    this.lastRefillTime = Date.now();
  }

  private getCurrentMonthKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  async refillToken(userIdentifier: string, userDetails: UserDetails): Promise<void> {
    const now = Date.now();

    const elapsedTime = now - this.lastRefillTime;
    const tokensToAdd = (elapsedTime / this.timeWindow) * 10;

    const userIdentifierExists = await this.storage.has(userIdentifier);
    let newTokens: number;

    if (userIdentifierExists) {
      const currentTokens = ((await this.storage.get(userIdentifier)) as number) || 0;
      newTokens = Math.min(+currentTokens + Math.floor(tokensToAdd), userDetails.maxRequestsPerTimeWindow);
    } else {
      newTokens = +userDetails.maxRequestsPerTimeWindow;
    }

    if (newTokens === userDetails.maxRequestsPerTimeWindow) {
      this.storage.set(userIdentifier, newTokens);
      this.lastRefillTime = now;
    }

    const monthlyKey = this.monthlyRequestKeyPrefix + this.getCurrentMonthKey() + `_${userIdentifier}`;
    const monthlyRequests = ((await this.storage.get(monthlyKey)) as number) || 0;
    this.storage.set(monthlyKey, monthlyRequests + 1);
  }

  async consumeToken(userIdentifier: string, userDetails: UserDetails): Promise<boolean> {
    const systemKey = 'systemRequests';
    const systemRequests = ((await this.storage.get(systemKey)) as number) || 0;
    if (systemRequests > this.maxRequestsAcrossSystem) {
      return false; // Hard throttling for the whole system
    }

    const monthlyKey = this.monthlyRequestKeyPrefix + this.getCurrentMonthKey() + `_${userIdentifier}`;
    const monthlyRequests = ((await this.storage.get(monthlyKey)) as number) || 0;

    if (monthlyRequests > userDetails.maxRequestsPerUserPerMonth) {
      return false; // Hard throttling for the user per month
    }

    const userIdentifierExists = await this.storage.has(userIdentifier);
    let currentTokens: number;

    if (userIdentifierExists) {
      currentTokens = (await this.storage.get(userIdentifier)) as number;
    } else {
      currentTokens = userDetails.maxRequestsPerTimeWindow;
    }

    currentTokens = +currentTokens;

    if (currentTokens > 0) {
      this.storage.set(systemKey, systemRequests + 1);
      this.storage.set(userIdentifier, currentTokens - 1);
      return true;
    } else {
      // TO-DO: Implement soft throttling for eligible customers
      return false;
    }
  }
}
