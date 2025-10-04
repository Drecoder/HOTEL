import { Resolver, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Booking } from './entities/booking.entity';
import { RoomEntity } from '../room/room.entity';
import { RoomService } from '../room/room.service';

// Auth imports (clean paths via tsconfig paths)
import { Role, } from '@hotel/auth/src/lib/';
import { Roles } from '@hotel/auth/src/lib/roles.decorators';
import { GqlAuthGuard } from '@hotel/auth/src/lib/gql-auth.guard';
import { RolesGuard } from '@hotel/auth/src/lib/roles.guard';

@Resolver(() => Booking)
@UseGuards(GqlAuthGuard, RolesGuard)
export class BookingResolver {
  constructor(private readonly roomService: RoomService) {}

  // FRONTDESK MUTATIONS
  @Mutation(() => Booking)
  @Roles(Role.FRONTDESK)
  async checkIn(
    @Args('bookingId', { type: () => ID }) bookingId: number,
    @Args('roomNumber') roomNumber: number,
  ): Promise<Booking> {
    return this.roomService.handleCheckIn(bookingId, roomNumber);
  }

  @Mutation(() => RoomEntity)
  @Roles(Role.FRONTDESK)
  async checkOut(
    @Args('roomNumber') roomNumber: number,
  ): Promise<RoomEntity> {
    return this.roomService.handleCheckOut(roomNumber);
  }
}
