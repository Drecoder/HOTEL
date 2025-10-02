import { Module, forwardRef } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { EventsService } from "./events.service";
import { RoomStatusListener } from "./room-status.listener";
import { RoomModule } from "../room/room.module";
import { PubSubModule } from "../graphql/pubsub.module";

@Module({
  imports: [
    forwardRef(() => RoomModule),
    PubSubModule, // for GraphQL subscription events

    // Kafka Client
    ClientsModule.registerAsync([
      {
        name: "KAFKA_CLIENT",
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => {
          const brokersString =
            configService.get<string>("KAFKA_BROKERS") || "localhost:9092";
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                brokers: brokersString.split(","),
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
  ],
  providers: [EventsService, RoomStatusListener],
  exports: [EventsService],
})
export class EventsModule {}
