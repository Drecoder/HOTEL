import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka, EachMessagePayload } from 'kafkajs';
import { RoomService } from '../room/room.service';
import { roomCache } from '../cache/cache.service';

@Injectable()
export class KafkaService implements OnModuleInit {
  private readonly kafka = new Kafka({
    clientId: 'nestjs-consumer-server',
    brokers: ['kafka:29092'],
  });

  private readonly consumer = this.kafka.consumer({
    groupId: 'hotel-ops-consumer-group-server',
  });

  private lastFetch = 0;

  constructor(private readonly roomService: RoomService) {}

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'room-events', fromBeginning: true });

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const message = payload.message.value?.toString();
        console.log(`[KafkaService] Received message: ${message}`);
        await this.handleRoomEvent();
      },
    });
  }

  private async handleRoomEvent() {
    const now = Date.now();
    if (now - this.lastFetch < 1000) {
      console.log(`[KafkaService] Throttled fetch — skipping`);
      return;
    }

    this.lastFetch = now;

    let rooms = roomCache.get('rooms');
    if (!rooms) {
      rooms = await this.roomService.findAllRooms();
      roomCache.set('rooms', rooms);
      console.log(`[KafkaService] Rooms fetched and cached at ${new Date().toISOString()}`);
    } else {
      console.log(`[KafkaService] Rooms served from cache at ${new Date().toISOString()}`);
    }
  }
}
