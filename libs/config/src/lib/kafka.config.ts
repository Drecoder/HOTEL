// Kafka transport config
import { Transport, ClientsModuleOptions } from '@nestjs/microservices';

export const kafkaConfig: ClientsModuleOptions = [
  {
    name: 'KAFKA_SERVICE',
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['kafka:29092'],
      },
      consumer: {
        groupId: 'hotel-ops-consumer-group-server',
      },
    },
  },
];
