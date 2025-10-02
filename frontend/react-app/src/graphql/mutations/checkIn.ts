import { gql } from "@apollo/client";
import { ROOM_FRAGMENT } from "../fragments/roomFragments";

export const CHECK_IN = gql`
  mutation CheckIn($bookingId: Int!, $roomNumber: Int!) {
    checkInRoom(bookingId: $bookingId, roomNumber: $roomNumber) {
      ...RoomFields
    }
  }
  ${ROOM_FRAGMENT}
`;
