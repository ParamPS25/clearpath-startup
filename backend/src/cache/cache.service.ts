import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly client: Redis | null;

  constructor(config: ConfigService) {
    const url = config.get<string>('REDIS_URL');
    this.client = url
      ? new Redis(url, {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          connectTimeout: 5000,
        })
      : null;
    this.client?.on('error', (err) =>
      this.logger.warn(`Redis error: ${err.message}`),
    );
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;
    try {
      const raw = await this.client.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (err) {
      this.logger.warn(
        `Redis GET failed for "${key}": ${(err as Error).message}`,
      );
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      this.logger.warn(
        `Redis SET failed for "${key}": ${(err as Error).message}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.quit().catch(() => undefined);
  }
}
