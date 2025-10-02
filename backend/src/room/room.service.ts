import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, EntityManager } from "typeorm";
import { RoomEntity } from "./room.entity";
import { Booking } from "../booking/entities/booking.entity";
import { BookingStatus } from "../booking/entities/booking.entity";
import { EventsService } from "../events/events.service";
import { RoomStatus } from "../common/constants/room-status.constants";
import { PubSubService } from "../graphql/pubsub.service"; // 👈 ADDED IMPORT

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);

  constructor(
    // NestJS injects the repository for TypeORM
    @InjectRepository(RoomEntity)
    private roomRepository: Repository<RoomEntity>,
    // NestJS injects the global EventsService (RabbitMQ Publisher)
    private eventsService: EventsService,
    // Add the PubSubService for GraphQL Subscriptions 👈 ADDED INJECTION
    private pubSubService: PubSubService
  ) {}

  /**
   * Core method to find a room and atomically update its status in PostgreSQL.
   * @param roomNumber The number of the room to update.
   * @param status The new RoomStatus value.
   * @returns The updated Room entity.
   */
  async findAllRooms(): Promise<RoomEntity[]> {
    this.logger.debug("Fetching all rooms from the database.");
    return this.roomRepository.find();
  }

  async updateStatus(
    roomNumber: number,
    status: keyof typeof RoomStatus
  ): Promise<RoomEntity> {
    // 1. Find the room using the column name defined in the entity (roomNumber or number)
    const room = await this.roomRepository.findOne({ where: { roomNumber } });

    // Use NestJS built-in exceptions for clean HTTP error codes
    if (!room) {
      this.logger.warn(`Attempted update on non-existent room: ${roomNumber}`);
      throw new NotFoundException(`Room with number ${roomNumber} not found.`);
    }

    // 2. Perform the update
    // The 'status' input (keyof typeof RoomStatus) is compatible with the RoomEntity status property
    room.status = status as RoomEntity["status"];
    await this.roomRepository.save(room);

    this.logger.debug(`Room ${roomNumber} status updated to ${status}.`);
    return room;
  }

  // ----------------------------------------------------------------------
  // Handler Methods with PubSub Integration
  // ----------------------------------------------------------------------

  /**
   * Handles the business flow for a guest checking out.
   * 1. Updates the database status to DIRTY.
   * 2. Publishes a 'roomUpdated' event to PubSub for real-time GraphQL updates. 👈 NEW
   * 3. Publishes a 'checkout' event to RabbitMQ for downstream systems.
   * @param roomNumber The room number checking out.
   * @returns The updated Room entity.
   */
  async handleCheckOut(roomNumber: number): Promise<RoomEntity> {
    this.logger.log(`Processing check-out for room ${roomNumber}`);

    // 1. Update PostgreSQL (Source of Truth)
    const room = await this.updateStatus(roomNumber, RoomStatus.DIRTY);

    // 2. Publish to PubSub (for GraphQL subscriptions) 👈 stays the same
    await this.pubSubService.publish("roomUpdated", { roomUpdated: room });

    // 3. Publish to Kafka safely
    try {
      const published = await this.eventsService.publish(
        "hotel_ops.frontdesk.checkout",
        {
          roomId: room.id,
          roomNumber: room.roomNumber,
          status: room.status,
          timestamp: new Date().toISOString(),
        }
      );
      if (!published) {
        this.logger.error(
          `Kafka publish returned false for checkout of room ${roomNumber}.`
        );
      }
    } catch (err) {
      this.logger.error(
        `Failed to publish checkout event for room ${roomNumber}: ${err.message}`,
        err.stack
      );
    }

    // 4. Return the updated room
    return room;
  }

  /**
   * Finds all available rooms of a specific type within a given date range.
   * Availability is checked against active ('PENDING', 'CHECKED_IN') bookings.
   * ... (Implementation remains unchanged)
   */
  async findAvailableRooms(
    roomTypeId: number,
    startDate: Date,
    endDate: Date
  ): Promise<RoomEntity[]> {
    this.logger.log(
      `Searching for available rooms of type ${roomTypeId} from ${startDate} to ${endDate}`
    );

    // Use a subquery to find the IDs of rooms that have overlapping active bookings.
    const conflictingRoomIdsQuery = this.roomRepository.manager
      .createQueryBuilder(Booking, "b")
      .select("b.roomId")
      .where("b.status IN ('PENDING', 'CHECKED_IN')")
      .andWhere(
        `
        (
          (:startDate < b.endDate AND :endDate > b.startDate)
        )
      `,
        { startDate, endDate }
      );

    // Find rooms that match the type, are READY, and whose IDs are NOT in the conflicting list.
    const availableRooms = await this.roomRepository
      .createQueryBuilder("r")
      .where("r.roomTypeId = :roomTypeId", { roomTypeId })
      .andWhere("r.status = :readyStatus", { readyStatus: RoomStatus.READY })
      .andWhere(`r.id NOT IN (${conflictingRoomIdsQuery.getSql()})`)
      .setParameters(conflictingRoomIdsQuery.getParameters())
      .getMany();

    return availableRooms;
  }

  /**
   * Handles the business flow for a guest checking in.
   * ...
   * This operation is wrapped in a transaction for atomicity.
   * @returns The updated Room entity.
   */
  async handleCheckIn(bookingId: number, roomNumber: number): Promise<Booking> {
    this.logger.log(
      `Processing check-in for booking ${bookingId} into room ${roomNumber}`
    );

    // Use a TypeORM transaction to ensure both Room and Booking updates are atomic (all or nothing)
    return this.roomRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        const bookingRepository =
          transactionalEntityManager.getRepository(Booking);
        const roomRepository =
          transactionalEntityManager.getRepository(RoomEntity);

        // --- 1. Validate and Update Room Status (OCCUPIED) ---
        const room = await roomRepository.findOne({ where: { roomNumber } });

        if (!room) {
          this.logger.warn(`Check-in failed: Room ${roomNumber} not found.`);
          throw new NotFoundException(
            `Room with number ${roomNumber} not found.`
          );
        }
        if (room.status !== RoomStatus.READY) {
          this.logger.warn(
            `Check-in failed: Room ${roomNumber} is ${room.status}, not READY.`
          );
          throw new Error(
            `Room ${roomNumber} is not READY for check-in (Status: ${room.status}).`
          );
        }

        room.status = RoomStatus.OCCUPIED;
        await roomRepository.save(room);

        // --- 2. Validate and Update Booking Status (CHECKED_IN) ---
        const booking = await bookingRepository.findOne({
          where: { id: bookingId },
        });

        if (!booking) {
          this.logger.warn(
            `Check-in failed: Booking ID ${bookingId} not found.`
          );
          throw new NotFoundException(`Booking ID ${bookingId} not found.`);
        }
        if (booking.status !== "PENDING") {
          this.logger.warn(
            `Check-in failed: Booking ${bookingId} status is ${booking.status}, not PENDING.`
          );
          throw new Error(
            `Booking ${bookingId} cannot be checked in, current status is ${booking.status}.`
          );
        }

        booking.status = BookingStatus.CHECKED_IN;
        booking.roomId = room.id; // Link the newly occupied room to the booking
        await bookingRepository.save(booking);

        this.logger.debug(
          `Booking ${bookingId} checked into Room ${roomNumber}. Status updated to OCCUPIED.`
        );

        // --- 3. Publish to PubSub (for GraphQL subscriptions) 👈 ADDED
        await this.pubSubService.publish("roomUpdated", { roomUpdated: room });

        // --- 4. Publish Event to RabbitMQ ---
        const published = await this.eventsService.publish(
          "hotel_ops.frontdesk.checkin",
          {
            roomId: room.id,
            bookingId: booking.id,
            roomNumber: room.roomNumber,
            status: room.status,
            timestamp: new Date().toISOString(),
          }
        );

        if (!published) {
          this.logger.error(
            `Failed to publish check-in event for room ${roomNumber}.`
          );
        }

        // Return the updated Booking entity
        return booking;
      }
    );
  }

  /**
   * Handles the business flow for housekeeping marking a room as clean.
   * 1. Updates the database status to READY.
   * 2. Publishes a 'roomUpdated' event to PubSub for real-time GraphQL updates. 👈 NEW
   * 3. Publishes a 'clean' event to RabbitMQ.
   * @param roomNumber The room number being cleaned.
   * @returns The updated Room entity.
   */
  async handleCleanRoom(roomNumber: number): Promise<RoomEntity> {
    const room = await this.updateStatus(roomNumber, RoomStatus.READY);

    // Publish to PubSub (for GraphQL subscriptions) 👈 ADDED
    await this.pubSubService.publish("roomUpdated", { roomUpdated: room });

    await this.eventsService.publish("hotel_ops.housekeeping.clean", {
      roomId: room.id,
      roomNumber: room.roomNumber,
      status: room.status,
      timestamp: new Date().toISOString(),
    });
    return room;
  }

  /**
   * 💡 Implemented Database Logic for E2E Reset.
   * ... (Implementation remains unchanged)
   */
  async resetRoomStatus(
    roomNumber: number,
    status: keyof typeof RoomStatus
  ): Promise<RoomEntity> {
    this.logger.log(
      `Attempting to reset or create room ${roomNumber} to ${status}`
    );

    // 1. Check if the room exists
    let room = await this.roomRepository.findOne({ where: { roomNumber } });

    // 2. If room exists, update its status
    if (room) {
      room.status = status as RoomEntity["status"];
    } else {
      // 3. If room does not exist, create a new one (common for E2E resets)
      // NOTE: This assumes roomTypeId can be NULL or has a default value.
      room = this.roomRepository.create({
        roomNumber,
        status: status as RoomEntity["status"],
      });
    }

    // 4. Save the updated or new room
    return this.roomRepository.save(room);
  }
}
