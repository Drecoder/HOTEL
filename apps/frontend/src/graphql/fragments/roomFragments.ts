import { gql } from "@apollo/client";

export const ROOM_FRAGMENT = gql`
  fragment RoomFields on RoomType { 
    id
    roomNumber
    status
    expectedCheckout
  }
`;
