import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookingService } from './booking.service';
import { BookingResolver } from './booking.resolver';
import { RoomModule } from '../room/room.module'; // Assuming RoomModule is imported for availability checks

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    RoomModule,
  ],
  providers: [BookingService, BookingResolver],
  exports: [BookingService],
})
export class BookingModule {}
