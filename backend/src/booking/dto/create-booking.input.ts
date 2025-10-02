import { InputType, Field, ID } from '@nestjs/graphql';
import { IsDate, IsNotEmpty, IsUUID, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateBookingInput {
  @Field(() => ID, { description: 'The ID of the desired RoomType (Single, Double, Suite).' })
  @IsNotEmpty()
  @IsInt()
  roomTypeId: number;

  @Field(() => ID, { description: 'The ID of the user making the booking.' })
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @Field(() => Date, { description: 'The desired check-in date.' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @Field(() => Date, { description: 'The desired check-out date.' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endDate: Date;
}