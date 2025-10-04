import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CreateBookingInput } from './dto/create-booking.input';
import { RoomService } from '../room/room.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly roomService: RoomService,
  ) {}

  async findMyBookings(userId: number): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { userId },
      relations: ['room'],
      order: { startDate: 'DESC' },
    });
  }

 async create(input: CreateBookingInput): Promise<Booking> {
  const { roomTypeId, startDate, endDate, userId } = input;

  // 1. Check for available rooms
  const availableRooms = await this.roomService.findAvailableRooms(
    roomTypeId,
    startDate,
    endDate,
  );

  if (availableRooms.length === 0) {
    throw new BadRequestException('No rooms available for the selected dates.');
  }

  // 2. Pick a room (first available)
  const selectedRoom = availableRooms[0];

  // 3. Create a new booking (type-safe)
  const newBooking = this.bookingRepository.create({
    userId,                    // number
    roomId: selectedRoom.id,   // number (match RoomEntity.id)
    startDate,
    endDate,
    status: BookingStatus.PENDING, // enum
  });

  // 4. Save to DB
  return this.bookingRepository.save(newBooking);
}


  async cancel(bookingId: number, userId: number): Promise<boolean> {
    const booking = await this.bookingRepository.findOne({ where: { id: bookingId } });

    if (!booking) throw new NotFoundException(`Booking ID ${bookingId} not found.`);
    if (booking.userId !== userId) throw new BadRequestException('Unauthorized');
    if (booking.startDate < new Date()) throw new BadRequestException('Cannot cancel after start date.');

    await this.bookingRepository.delete(bookingId);
    return true;
  }
}
