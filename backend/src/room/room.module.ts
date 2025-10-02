// backend/src/room/room.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomEntity } from './room.entity';
import { RoomService } from './room.service';
import { RoomResolver } from './room.resolver';
import { EventsModule } from 'src/events/events.module';
// Note: EventsModule is typically imported in the root AppModule as @Global()
// but if it wasn't global, you would import it here:
// import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    // 1. Register the Room entity with TypeORM
    TypeOrmModule.forFeature([RoomEntity]), 
    forwardRef(() => EventsModule),
    // If EventsModule wasn't global, add it here:
    // EventsModule, 
  ],
  providers: [
    // 2. Register the service (business logic)
    RoomService, 
    // 3. Register the resolver (GraphQL API entry point)
    RoomResolver,
  ],
  // 4. Export the service so other modules can inject it (e.g., GuestModule for validation)
  exports: [RoomService],
})
export class RoomModule {}