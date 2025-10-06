// backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';

//  import { EventsService } from './events/events.service'; 
//  import { RoomStatusListener } from './events/room-status.listener'; 

const PORT = process.env.PORT || 8080; 

async function bootstrap() {
const logger = new Logger('NestApplication');
// NestJS will now attempt to load AppModule, which initializes TypeOrmModule 
// using the environment variables logged above.
const app = await NestFactory.create(AppModule); 

app.useGlobalPipes(new ValidationPipe({
whitelist: true, 
forbidNonWhitelisted: true,
transform: true, 
}));

app.enableCors({
origin: '*', 
methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
credentials: true,
});

// 💡 KAFKA DEBUG LOG: Log resolved Kafka brokers before connecting
const resolvedKafkaBrokers = process.env.KAFKA_BROKERS || 'localhost:9092';
logger.log(`[KAFKA DEBUG] Resolved Brokers: ${resolvedKafkaBrokers}`, 'Bootstrap');

// Configure and connect the Kafka Microservice consumer
app.connectMicroservice({
transport: Transport.KAFKA,
options: {
client: {
brokers: resolvedKafkaBrokers.split(','), // Use resolved variable here
},
consumer: {
groupId: 'hotel-ops-consumer-group', 
},
},
});

// Start all registered microservices (Kafka consumer)
await app.startAllMicroservices();
logger.log('✅ Kafka Consumer Listener Initialized.');

// Start the main HTTP/GraphQL Server
await app.listen(PORT, () => {
logger.log(`🚀 GraphQL API Server running on http://localhost:${PORT}/graphql`);
logger.log(`⚡ WebSocket Subscriptions available on ws://localhost:${PORT}/graphql`);
});
}

bootstrap();
