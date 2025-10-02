// src/service/entities/service.entity.ts
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Booking } from './booking.entity';

@Entity('services')
@ObjectType()
export class Service {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  @Field()
  name: string;

  @ManyToMany(() => Booking, booking => booking.services)
  bookings: Booking[];
}
