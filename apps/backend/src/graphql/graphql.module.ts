// backend/src/graphql/graphql.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';

// Import your resolvers
import { BookingResolver } from '../booking/booking.resolver';
import { RoomResolver } from '../room/room.resolver';

@Module({
  imports: [
   GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
    }),
  ],
  providers: [
    // Make sure Nest knows about your resolvers
    BookingResolver,
    RoomResolver,
  ],
})
export class AppGraphQLModule {}
