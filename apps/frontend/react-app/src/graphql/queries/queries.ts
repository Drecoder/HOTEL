import { gql } from '@apollo/client';

export const GET_AVAILABLE_ROOMS = gql`
  query AvailableRooms($roomTypeId: Int!, $startDate: String!, $endDate: String!) {
    availableRooms(roomTypeId: $roomTypeId, startDate: $startDate, endDate: $endDate) {
      id
      roomNumber
      status
      expectedCheckout
    }
  }
`;

export const GET_BOOKING_IDS = gql`
  query GetBookingIds {
    bookings {
      id
    }
  }
`;
