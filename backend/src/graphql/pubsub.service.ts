// backend/src/graphql/pubsub.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
// import { RedisPubSub } from 'graphql-redis-subscriptions'; // Optional for production scaling

@Injectable()
export class PubSubService extends PubSub implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PubSubService.name);

  constructor() {
    // Initialize the base PubSub (in-memory, single-instance)
    super();
    this.logger.log('✅ PubSub service initialized (in-memory)');
  }

  onModuleInit() {
    // Connection health check for RedisPubSub could go here
  }

  onModuleDestroy() {
    // Clean shutdown (e.g., RedisPubSub.disconnect())
  }

  async publish<T>(triggerName: string, payload: T): Promise<void> {
    this.logger.verbose(`📢 Publishing event: ${triggerName}`);
    return super.publish(triggerName, payload);
  }

  asyncIterator<T>(triggers: string | string[]): AsyncIterator<T> {
    return super.asyncIterator(triggers);
  }
}
