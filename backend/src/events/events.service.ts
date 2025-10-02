// backend/src/events/events.service.ts

import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices'; // NEW: Use the NestJS Kafka client

// Since you are using NestJS Microservices, environment variables 
// are read by ConfigService in the module config (as shown previously).
const TOPIC_PREFIX = 'hotel_ops.'; // Standard topic naming convention

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  // INJECT: Use the token defined in your EventsModule (ClientsModule.registerAsync)
  // NestJS manages the connection lifecycle (OnModuleInit, etc.) automatically.
  constructor(
    @Inject('KAFKA_CLIENT') 
    private readonly kafkaClient: ClientKafka // Type for the injected Kafka client
  ) {}

  /**
   * Publishes an event to a Kafka topic.
   * Kafka does not require manual 'drain' handling like RabbitMQ;
   * kafkajs handles backpressure internally.
   */
  async publish(routingKey: string, payload: any): Promise<boolean> {
    const topic = `${TOPIC_PREFIX}${routingKey}`;
    const key = topic.split('.').pop(); // Use the final part of the key for message grouping/ordering
    
    // NestJS uses .emit() for events where no response is expected (fire-and-forget)
    try {
      // Kafka payload requires a 'value' property. The key is optional but highly recommended.
      const kafkaMessage = {
        key: key, 
        value: JSON.stringify(payload),
      };

      // .emit() returns an Observable; we convert it to a Promise using .toPromise()
      // Note: NestJS 9+ may require a simple .subscribe() or similar for the Observable.
      await this.kafkaClient.emit(topic, kafkaMessage).toPromise();

      this.logger.debug(`Event published to Kafka topic: ${topic} with key: ${key}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to publish event to Kafka topic: ${topic}`, error.stack);
      // Unlike RabbitMQ where you manage a channel, connection failure is handled by the client
      return false;
    }
  }

  // --- Consumer Logic is MOVED to Listeners/Controllers ---
  
  // The 'consume' logic is not needed here. In NestJS, a consumer is implemented 
  // by marking a method in a separate service (like RoomStatusListener) 
  // with the @MessagePattern() decorator.
  
  // The Kafka client handles message fetching, offset management, and automatic acks.
}