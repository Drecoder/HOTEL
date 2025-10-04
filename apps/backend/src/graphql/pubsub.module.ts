// backend/src/graphql/pubsub.module.ts

import { Module, Global } from '@nestjs/common';
import { PubSubService } from './pubsub.service'; // Assuming pubsub.service.ts exists

@Global() // Make this service available globally to all modules for easy injection
@Module({
  providers: [PubSubService],
  exports: [PubSubService], // MUST be exported so other modules can use it
})
export class PubSubModule {}