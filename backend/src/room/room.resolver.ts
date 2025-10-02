import {
  Resolver,
  Mutation,
  Args,
  Query,
  Int,
  Subscription,
} from "@nestjs/graphql";
import { RoomService } from "./room.service";
import { RoomType } from "./room.type";
import { Booking } from "../booking/entities/booking.entity";
import { UsePipes, ValidationPipe } from "@nestjs/common";
import { PubSubService } from "../graphql/pubsub.service";

@Resolver(() => RoomType)
export class RoomResolver {
  constructor(
    private readonly roomService: RoomService,
    private readonly pubSubService: PubSubService
  ) {}

  /**
   * Defines the GraphQL Mutation 'resetRoom'.
   * This mutation is essential for E2E testing to ensure a clean slate.
   * * @param roomNumber The number of the room to reset.
   * @returns The updated Room object.
   */
  @Mutation(() => RoomType, {
    name: "resetRoom",
    description: "Resets a room to a READY status for testing purposes.",
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async resetRoom(
    @Args("roomNumber", { type: () => Int }) roomNumber: number
  ): Promise<RoomType> {
    // 1. Logic to reset or create the room
    const room = await this.roomService.resetRoomStatus(roomNumber, "READY");

    // 2. Publish an internal event for microservices if needed (optional, but good practice)
    // await this.kafkaProducerService.sendEvent('room.reset', { roomNumber, status: 'READY' });

    return room;
  }
  // ----------------------------
  // QUERIES
  // ----------------------------

  @Query(() => Boolean, { name: "serverHealth" })
  serverHealth(): boolean {
    return true; // Simple health check
  }

  @Query(() => [RoomType], { name: "findAllRooms" })
  async findAllRooms(): Promise<RoomType[]> {
    return this.roomService.findAllRooms();
  }

  @Query(() => [RoomType])
  async rooms(): Promise<RoomType[]> {
    return this.roomService.findAllRooms();
  }

  // ----------------------------
  // MUTATIONS
  // ----------------------------

  /**
   * [FRONTDESK] Guest check-in
   * Returns the Booking object
   */
  @Mutation(() => Booking)
  async checkIn(
    @Args("bookingId", { type: () => Int }) bookingId: number,
    @Args("roomNumber", { type: () => Int }) roomNumber: number
  ): Promise<Booking> {
    return this.roomService.handleCheckIn(bookingId, roomNumber);
  }

  /**
   * [FRONTDESK] Guest check-out
   * Returns the updated Room
   */
  @Mutation(() => RoomType)
  async checkOut(
    @Args("roomNumber", { type: () => Int }) roomNumber: number
  ): Promise<RoomType> {
    return this.roomService.handleCheckOut(roomNumber);
  }

  /**
   * [HOUSEKEEPING] Clean a room
   * Returns the updated Room
   */
  @Mutation(() => RoomType)
  async cleanRoom(
    @Args("roomNumber", { type: () => Int }) roomNumber: number
  ): Promise<RoomType> {
    return this.roomService.handleCleanRoom(roomNumber);
  }

  @Subscription(() => RoomType, {
    name: "roomUpdated",
    resolve: (payload) => payload.roomUpdated,
  })
  roomUpdated() {
    return this.pubSubService.asyncIterator("roomUpdated");
  }
}
