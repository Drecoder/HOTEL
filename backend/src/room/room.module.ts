import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RoomEntity } from "./room.entity";
import { RoomService } from "./room.service";
import { RoomResolver } from "./room.resolver";
import { EventsModule } from "../events/events.module";
import { PubSubModule } from "../graphql/pubsub.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([RoomEntity]),
    forwardRef(() => EventsModule), // for circular dependency
    PubSubModule, // global, but safe to include
  ],
  providers: [RoomService, RoomResolver],
  exports: [RoomService],
})
export class RoomModule {}
