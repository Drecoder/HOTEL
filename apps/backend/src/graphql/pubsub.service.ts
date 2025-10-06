import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { RedisOptions } from 'ioredis';

@Injectable()
export class PubSubService implements OnModuleDestroy {
  private readonly logger = new Logger(PubSubService.name);
  private readonly pubSub: RedisPubSub;

  constructor() {
    const options: RedisOptions = {
      host: 'localhost',
      port: 6379,
      retryStrategy: times => Math.min(times * 50, 2000),
    };

    this.pubSub = new RedisPubSub({ connection: options });
    this.logger.log('✅ RedisPubSub initialized');
  }

  async publish<T>(trigger: string, payload: T): Promise<void> {
    this.logger.verbose(`📢 Publishing to ${trigger}`);
    await this.pubSub.publish(trigger, payload);
  }

  async subscribe<T>(trigger: string, handler: (payload: T) => void): Promise<number> {
    return this.pubSub.subscribe(trigger, handler);
  }

  async unsubscribe(subId: number): Promise<void> {
    await this.pubSub.unsubscribe(subId);
  }

  asyncIterator<T>(trigger: string | string[]): AsyncIterator<T> {
    return this.pubSub.asyncIterator(trigger);
  }

  onModuleDestroy() {
    this.pubSub.close();
    this.logger.log('🛑 RedisPubSub connection closed');
  }
}
