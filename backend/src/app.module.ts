// backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

// Local Imports
import { typeOrmConfig } from './db/postgres.config';
import { RoomModule } from './room/room.module'; 
import { EventsModule } from './events/events.module'; 
import { PubSubModule } from './graphql/pubsub.module';
import { KafkaService } from './kafka/kafka.service';

@Module({
  imports: [
    // 1. Configuration Module
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Database Connection
    TypeOrmModule.forRoot(typeOrmConfig),

    // 3. GraphQL Setup
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
    }),

    // 4. Feature Modules
    RoomModule,

    // 5. Infrastructure Module
    EventsModule,

    // 6. PubSub Module
    PubSubModule,
  ],
  providers: [KafkaService],
})
export class AppModule {}
