// backend/src/events/room-status.listener.ts

import { Controller, Logger } from "@nestjs/common"; // Use @Controller
import { MessagePattern, Payload } from "@nestjs/microservices"; // NEW: Kafka decorators
import { PubSubService } from "../graphql/pubsub.service";
import { RoomService } from "../room/room.service";


// NOTE: EventsService is no longer needed in the listener for consumption!
// Kafka consumption is handled automatically by the @MessagePattern decorator.
// Update the import path to the correct location of kafka.constants
import { KAFKA_TOPICS } from "../kafka/kafka.constants";

@Controller() // Use @Controller or @EventGateway
export class RoomStatusListener {
  private readonly logger = new Logger(RoomStatusListener.name);
  // Topic pattern (no longer a routing key pattern)
  private readonly ROOM_READY_TOPIC = "hotel_ops.operations.room_ready"; 
  
  constructor(
    private pubSubService: PubSubService,
    private roomService: RoomService
  ) {}

  // **REMOVE onModuleInit()** and all manual this.eventsService.consume() logic!

  /**
   * Processes incoming Kafka messages.
   * NestJS automatically subscribes this method to the configured topic.
   * The underlying kafkajs client handles deserialization and ACK/NACK automatically
   * based on whether an exception is thrown.
   */
  @MessagePattern(KAFKA_TOPICS.ROOM_EVENTS)
  async handleRoomReadyEvent(@Payload() payload: any): Promise<void> {
    
    // NOTE: The payload is the JSON object already parsed by the NestJS microservice layer.
    this.logger.debug(`Received Kafka event from topic: ${this.ROOM_READY_TOPIC} for room ${payload.roomNumber}`);

    // --- Core Logic Remains the Same ---
    try {
      // 1. Event Processing
      const updatedRoom = await this.roomService.updateStatus(
        payload.roomNumber, 
        "READY" // Pass the string literal as required by the parameter type
      );

      // 2. Trigger Real-time GraphQL Subscription
      await this.pubSubService.publish("ROOM_STATUS_UPDATED", {
        roomStatusUpdated: updatedRoom,
      });

      this.logger.verbose(`Successfully processed 'room_ready' event. Room ${updatedRoom.roomNumber} is READY.`);
      
      // 3. Acknowledgment: NestJS/Kafka automatically ACK the message 
      //    since the method completed successfully (no throw).

    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error processing Kafka message: ${error.message}`, error.stack, JSON.stringify(payload));
      } else {
        this.logger.error(`Error processing Kafka message: ${JSON.stringify(error)}`, undefined, JSON.stringify(payload));
      }
      
      // 4. Negative Acknowledge (NACK): Throwing the error tells the 
      //    NestJS Microservice container to handle the retry/failure logic.
      //    (This is typically configured in the Kafka client options).
      throw error; 
    }
  }
}