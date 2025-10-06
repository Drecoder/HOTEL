import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { ObjectType, Field, ID } from "@nestjs/graphql";
import { RoomStatus } from "../common/room-status.constants";
import { Booking } from "../booking/entities/booking.entity"; // Add this import

@Entity("rooms")
@ObjectType()
export class RoomEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field(() => ID)
  id!: number;

  @Column({ name: "room_number", unique: true })
  @Field()
  roomNumber!: number;

  @Column({
    type: process.env.NODE_ENV === "test" ? "simple-enum" : "enum",
    enum: RoomStatus,
    default: RoomStatus.READY,
  })
  @Field(() => RoomStatus)
  status: RoomStatus;

  @Column({
    name: "expected_checkout",
    type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamptz',
    nullable: true,
    default: null,
  })
  @Field({ nullable: true })
  expectedCheckout!: Date | null;

  @OneToMany(() => Booking, (booking) => booking.room)
  bookings!: Booking[];
}
