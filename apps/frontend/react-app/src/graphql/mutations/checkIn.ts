import { gql } from "@apollo/client";

export const CHECK_IN = gql`
  mutation CheckIn($bookingId: Int!, $roomNumber: Int!) {
    checkInRoom(bookingId: $bookingId, roomNumber: $roomNumber) {
      id
      roomNumber
      status
      expectedCheckout
    }
  }
`;
