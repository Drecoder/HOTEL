import { Test, TestingModule } from "@nestjs/testing";
import { RoomService } from "../../src/room/room.service";
import { RoomEntity } from "../../src/room/room.entity";
import { Booking, BookingStatus } from "../../src/booking/entities/booking.entity";
import { EventsService } from "../../src/events/events.service";
import { PubSubService } from "../../src/graphql/pubsub.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { RoomStatus } from "../../src/common/constants/room-status.constants";
import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import { EntityManager } from "typeorm";

describe("RoomService with in-memory DB", () => {
  let service: RoomService;
  let eventsService: { publish: jest.MockedFunction<(...args: any[]) => Promise<void>> };

  let rooms: RoomEntity[];
  let bookings: Booking[];

  // --- Room repository mock ---
  const createRoomRepo = () => {
    const repo = {
      find: jest.fn(() => Promise.resolve(rooms)),
      findOne: jest.fn(({ where: { roomNumber, id } }) => {
        const r = rooms.find(r => r.roomNumber === roomNumber || r.id === id);
        return Promise.resolve(r || null);
      }),
      save: jest.fn((room: RoomEntity) => {
        const index = rooms.findIndex(r => r.id === room.id);
        if (index >= 0) rooms[index] = room;
        else rooms.push(room);
        return Promise.resolve(room);
      }),
      create: jest.fn((data: Partial<RoomEntity> = {}): RoomEntity => ({
        id: rooms.length + 1,
        roomNumber: data.roomNumber ?? 0,
        status: data.status ?? RoomStatus.READY,
        expectedCheckout: data.expectedCheckout ?? null,
        bookings: data.bookings ?? [],
      })),
      manager: {
        transaction: jest.fn(async (fn: (em: EntityManager) => Promise<any>) => {
          const mockEntityManager: Partial<EntityManager> = {
            getRepository: jest.fn((entity) => {
              if (entity === Booking) return bookingRepo;
              if (entity === RoomEntity) return repo;
              return {} as any;
            }),
          };
          return fn(mockEntityManager as unknown as EntityManager);
        }),
      },
    };
    return repo;
  };

  // --- Booking repository mock ---
  const createBookingRepo = () => ({
    findOne: jest.fn(({ where: { id } }) => {
      const b = bookings.find(b => b.id === id);
      return Promise.resolve(b || null);
    }),
    save: jest.fn((b: Booking) => {
      const index = bookings.findIndex(bb => bb.id === b.id);
      if (index >= 0) bookings[index] = b;
      else bookings.push(b);
      return Promise.resolve(b);
    }),
  });

  let roomRepo: ReturnType<typeof createRoomRepo>;
  let bookingRepo: ReturnType<typeof createBookingRepo>;

  // Mock PubSubService
  const pubSubServiceMock = {
    publish: jest.fn(async () => void 0),
  };

  beforeEach(async () => {
    rooms = [
      { id: 1, roomNumber: 101, status: RoomStatus.READY },
      { id: 2, roomNumber: 102, status: RoomStatus.DIRTY },
    ] as RoomEntity[];

    bookings = [
      { id: 1, status: BookingStatus.PENDING, roomId: null },
      { id: 2, status: BookingStatus.CHECKED_IN, roomId: 1 },
    ] as Booking[];

    roomRepo = createRoomRepo();
    bookingRepo = createBookingRepo();

    eventsService = { publish: jest.fn(async () => void 0) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        { provide: getRepositoryToken(RoomEntity), useValue: roomRepo },
        { provide: getRepositoryToken(Booking), useValue: bookingRepo },
        { provide: EventsService, useValue: eventsService },
        { provide: PubSubService, useValue: pubSubServiceMock }, // <-- use class, not string
      ],
    }).compile();

    service = module.get(RoomService);
  });

  it("handleCheckOut updates room and publishes event", async () => {
    const result = await service.handleCheckOut(101);
    expect(result.status).toBe(RoomStatus.DIRTY);
    expect(rooms.find(r => r.roomNumber === 101)?.status).toBe(RoomStatus.DIRTY);
    expect(eventsService.publish).toHaveBeenCalled();
  });

  it("handleCleanRoom updates room and publishes event", async () => {
    const result = await service.handleCleanRoom(102);
    expect(result.status).toBe(RoomStatus.READY);
    expect(rooms.find(r => r.roomNumber === 102)?.status).toBe(RoomStatus.READY);
    expect(eventsService.publish).toHaveBeenCalled();
  });

  it("handleCheckIn updates booking and room", async () => {
    bookings[0].status = BookingStatus.PENDING;
    rooms[0].status = RoomStatus.READY;

    const result = await service.handleCheckIn(1, 101);
    expect(result.status).toBe(BookingStatus.CHECKED_IN);
    expect(rooms[0].status).toBe(RoomStatus.OCCUPIED);
    expect(result.roomId).toBe(rooms[0].id);
    expect(eventsService.publish).toHaveBeenCalled();
  });
});
