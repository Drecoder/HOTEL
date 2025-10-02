import { gql } from "@apollo/client";

export const ROOM_FRAGMENT = gql`
  fragment RoomFields on Room {
    id
    roomNumber
    status
    expectedCheckout
  }
`;
