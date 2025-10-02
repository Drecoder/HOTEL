import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { kafkaConfig } from '../config/kafka.config';
import { KafkaService } from './kafka.service';

@Module({
  imports: [ClientsModule.register(kafkaConfig)],
  providers: [KafkaService],
})
export class KafkaModule {}
