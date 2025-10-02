import {
  jest,
  beforeAll,
  afterAll,
  beforeEach,
  describe,
  it,
  expect,
} from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RoomService } from "../../src/room/room.service";
import { RoomEntity } from "../../src/room/room.entity";
import {
  Booking,
  BookingStatus,
} from "../../src/booking/entities/booking.entity";
import { Service } from "../../src/booking/entities/service.entity";
import { EventsService } from "../../src/events/events.service";
import { PubSubService } from "../../src/graphql/pubsub.service"; // ✅ Add import
import { RoomStatus } from "../../src/common/constants/room-status.constants";
import { DataSource } from "typeorm";

jest.setTimeout(30000);

describe("RoomService (Integration)", () => {
  let module: TestingModule;
  let service: RoomService;
  let dataSource: DataSource;

  const eventsServiceMock: Partial<EventsService> = {
    publish: jest.fn(async (_routingKey: string, _payload: any) => true),
  };

  const pubSubServiceMock: Partial<PubSubService> = {
    publish: jest.fn(async (_event: string, _payload: any) => {}),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          dropSchema: true,
          entities: [RoomEntity, Booking, Service],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([RoomEntity, Booking, Service]),
      ],
      providers: [
        RoomService,
        { provide: EventsService, useValue: eventsServiceMock },
        { provide: PubSubService, useValue: pubSubServiceMock }, // ✅ Provide mock
      ],
    }).compile();

    service = module.get(RoomService);
    dataSource = module.get(DataSource);

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) await dataSource.destroy();
    if (module) await module.close();
  });

  beforeEach(async () => {
    await dataSource.getRepository(Booking).clear();
    await dataSource.getRepository(RoomEntity).clear();
    await dataSource.getRepository(Service).clear();
    jest.clearAllMocks();
  });

  it("should check in a booking and update room status", async () => {
    const roomRepo = dataSource.getRepository(RoomEntity);
    const bookingRepo = dataSource.getRepository(Booking);

    const room = await roomRepo.save({
      roomNumber: 101,
      status: RoomStatus.READY,
    });

    const booking = await bookingRepo.save({
      userId: 1,
      roomId: room.id,
      status: BookingStatus.PENDING,
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      services: [],
    });

    const result = await service.handleCheckIn(booking.id, room.roomNumber);

    expect(result.status).toBe(BookingStatus.CHECKED_IN);

    const updatedRoom = await roomRepo.findOneBy({ id: room.id });
    expect(updatedRoom?.status).toBe(RoomStatus.OCCUPIED);

    expect(eventsServiceMock.publish).toHaveBeenCalledWith(
      "hotel_ops.frontdesk.checkin",
      expect.objectContaining({ bookingId: booking.id, roomId: room.id })
    );
  });

  it("should handle checkout and mark room dirty", async () => {
    const roomRepo = dataSource.getRepository(RoomEntity);

    const room = await roomRepo.save({
      roomNumber: 101,
      status: RoomStatus.OCCUPIED,
    });

    const result = await service.handleCheckOut(room.roomNumber);

    expect(result.status).toBe(RoomStatus.DIRTY);

    expect(eventsServiceMock.publish).toHaveBeenCalledWith(
      "hotel_ops.frontdesk.checkout",
      expect.objectContaining({ roomId: room.id })
    );
  });
});
