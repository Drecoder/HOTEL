import { ObjectType, Field, ID, registerEnumType, Int } from "@nestjs/graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  CreateDateColumn,
} from "typeorm";
import { RoomEntity } from "../../room/room.entity";
import { Service } from "./service.entity";

export enum BookingStatus {
  PENDING = "PENDING",
  CHECKED_IN = "CHECKED_IN",
  CANCELLED = "CANCELLED",
}

registerEnumType(BookingStatus, {
  name: "BookingStatus",
});

@Entity("bookings")
@ObjectType()
export class Booking {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column({ type: "uuid", name: "room_id" })
  roomId: number;

  @ManyToOne(() => RoomEntity, (room) => room.bookings)
  @JoinColumn({ name: "room_id" })
  @Field(() => RoomEntity)
  room: RoomEntity;

  @Column({ type: "integer", name: "user_id" })
  @Field(() => ID)
  userId: number;

  @Column({ type: "date", name: "start_date" })
  @Field(() => Date)
  startDate: Date;

  @Column({ type: "date", name: "end_date" })
  @Field(() => Date)
  endDate: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ManyToMany(() => Service, (service) => service.bookings, { cascade: true })
  @JoinTable({
    name: "booking_services",
    joinColumn: { name: "booking_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "service_id", referencedColumnName: "id" },
  })
  @Field(() => [Service], { nullable: true })
  services: Service[];

  @Column({
    type: process.env.NODE_ENV === "test" ? "simple-enum" : "enum",
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  @Field(() => BookingStatus)
  status: BookingStatus;

  @Field(() => Int)
  get roomNumber(): number {
    return this.room?.roomNumber;
  }
}
