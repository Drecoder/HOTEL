// backend/src/common/constants/room-status.constants.ts

import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum RoomStatus {
  OCCUPIED = 'OCCUPIED',
  DIRTY = 'DIRTY',
  CLEANING = 'CLEANING',
  READY = 'READY',
  MAINTENANCE = 'MAINTENANCE',
}

// Register with GraphQL
registerEnumType(RoomStatus, {
  name: 'RoomStatus',
  description: 'The current cleanliness and occupancy status of the hotel room',
});

@ObjectType()
export class RoomType {
  @Field(() => ID)
  id: string;

  @Field(() => RoomStatus)  // 👈 use the enum value
  status: RoomStatus;       // 👈 use the enum type
}