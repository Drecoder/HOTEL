import { Resolver, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Booking } from './entities/booking.entity';
import { RoomEntity } from '../room/room.entity';
import { Role } from '../auth/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorators';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RoomService } from '../room/room.service';

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
