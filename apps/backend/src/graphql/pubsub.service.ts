import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import type { PubSubEngine } from 'graphql-subscriptions';
// import { RedisPubSub } from 'graphql-redis-subscriptions'; // For production

@Injectable()
export class PubSubService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PubSubService.name);
  private readonly pubSub: PubSub<any>; // use concrete PubSub type

  constructor() {
    // Initialize in-memory PubSub
    this.pubSub = new PubSub<any>();
    this.logger.log('✅ PubSub service initialized (in-memory)');
  }

  onModuleInit() {
    // Connection check for RedisPubSub could go here
  }

  onModuleDestroy() {
    // Cleanup (e.g. RedisPubSub.disconnect())
  }

  async publish<T>(triggerName: string, payload: T): Promise<void> {
    this.logger.verbose(`📢 Publishing event: ${triggerName}`);
    await this.pubSub.publish(triggerName, payload);
  }

  asyncIterator<T>(triggers: string | string[]): AsyncIterator<T> {
    // PubSub from graphql-subscriptions provides asyncIterator()
    return this.pubSub.asyncIterator<T>(triggers);
  }
}
