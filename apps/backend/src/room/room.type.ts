import { ObjectType, Field, Int, ID, registerEnumType } from '@nestjs/graphql';
import { RoomStatus } from '../common/room-status.constants';

registerEnumType(RoomStatus, {
  name: 'RoomStatus',
  description: 'The current cleanliness and occupancy status of the hotel room',
});

@ObjectType()
export class RoomType {
  @Field(() => ID)
  id!: number;

  @Field(() => Int)
  roomNumber!: number;

  @Field(() => RoomStatus)
  status!: RoomStatus;

  @Field(() => Date, { nullable: true })
  expectedCheckout?: Date;

  @Field(() => RoomStatus, { nullable: true })
  roomType?: RoomStatus;
}
