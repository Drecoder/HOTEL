import { Resolver, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Booking } from './entities/booking.entity';
import { RoomEntity } from '../room/room.entity';
import { RoomService } from '../room/room.service';

// Auth imports (clean paths via tsconfig paths)
import { Roles } from '../auth/roles.decorators';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/role.enum';

@Resolver(() => Booking)
@UseGuards(GqlAuthGuard, RolesGuard)
export class BookingResolver {
  constructor(private readonly roomService: RoomService) {}

  @Mutation(() => Booking)
  @Roles(Role.FRONTDESK)
  async checkIn(
    @Args('bookingId', { type: () => ID }) bookingId: number,
    @Args('roomNumber') roomNumber: number
  ): Promise<Booking> {
    return this.roomService.handleCheckIn(bookingId, roomNumber);
  }

  @Mutation(() => RoomEntity)
  @Roles(Role.FRONTDESK)
  async checkOut(@Args('roomNumber') roomNumber: number): Promise<RoomEntity> {
    return this.roomService.handleCheckOut(roomNumber);
  }
}
