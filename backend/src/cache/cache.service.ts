import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

// Free-tier Redis Cloud closes idle connections; a periodic PING keeps the
// connection warm so a real request never pays the reconnect cost.
const KEEPALIVE_INTERVAL_MS = 4 * 60 * 1000;

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly client: Redis | null;
  private keepAliveTimer?: NodeJS.Timeout;

  constructor(config: ConfigService) {
    const url = config.get<string>('REDIS_URL');
    this.client = url
      ? new Redis(url, {
          maxRetriesPerRequest: 3,
          connectTimeout: 5000,
        })
      : null;
    this.client?.on('error', (err) =>
      this.logger.warn(`Redis error: ${err.message}`),
    );
  }

  onModuleInit(): void {
    if (!this.client) return;
    this.keepAliveTimer = setInterval(() => {
      this.client
        ?.ping()
        .catch((err) =>
          this.logger.warn(
            `Redis keepalive ping failed: ${(err as Error).message}`,
          ),
        );
    }, KEEPALIVE_INTERVAL_MS);
    this.keepAliveTimer.unref();
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
    clearInterval(this.keepAliveTimer);
    await this.client?.quit().catch(() => undefined);
  }
}
