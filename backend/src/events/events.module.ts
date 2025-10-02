import { Module, forwardRef, Inject } from "@nestjs/common";
import { ClientsModule, Transport, ClientKafka } from "@nestjs/microservices"; // <--- NEW IMPORTS
import { ConfigModule, ConfigService } from "@nestjs/config"; // <--- NEW IMPORTS
import { EventsService } from "./events.service";
import { RoomStatusListener } from "./room-status.listener";
import { RoomModule } from "../room/room.module";
import { PubSubModule } from "../graphql/pubsub.module"; // Module providing PubSubService

@Module({
  imports: [
    forwardRef(() => RoomModule),
    PubSubModule, // Keeps your GraphQL dependencies for real-time updates

    // ----------------------------------------------------
    // START: KAFKA CONFIGURATION
    // ----------------------------------------------------
    ClientsModule.registerAsync([
      {
        name: "KAFKA_CLIENT",
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => {
          // FIX: Provide a default string using the || operator.
          // This prevents the application from crashing on '.split()' if the value is undefined.
          const brokersString =
            configService.get<string>("KAFKA_BROKERS") || "localhost:9092";

          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                brokers: brokersString.split(","), // This line is now safe
                clientId: "hotel-ops-backend",
              },
              consumer: {
                groupId: "hotel-ops-consumer-group",
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
    // ----------------------------------------------------
    // END: KAFKA CONFIGURATION
    // ----------------------------------------------------
  ],
  providers: [EventsService, RoomStatusListener],
  exports: [EventsService],
})
export class EventsModule {}
