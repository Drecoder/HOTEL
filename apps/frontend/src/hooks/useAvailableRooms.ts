import { useQuery } from '@apollo/client';
import { GET_AVAILABLE_ROOMS, GET_BOOKING_IDS } from '../graphql/queries/queries';
import type { Room, Booking } from '../types/graphql';

export const useAvailableRooms = (roomTypeId: number, startDate: Date, endDate: Date) => {
  const { data, loading, error } = useQuery<{ availableRooms: Room[] }>(GET_AVAILABLE_ROOMS, {
    variables: {
      roomTypeId,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    },
  });

  return {
    rooms: data?.availableRooms ?? [],
    loading,
    error,
  };
};

export const useBookingIds = () => {
  const { data, loading, error } = useQuery<{ bookings: Booking[] }>(GET_BOOKING_IDS);

  return {
    bookingIds: data?.bookings ?? [],
    loading,
    error,
  };
};
