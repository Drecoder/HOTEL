import { gql } from "@apollo/client";

export const CLEAN_ROOM = gql`
  mutation CleanRoom($roomNumber: Int!) {
    cleanRoom(roomNumber: $roomNumber) {
      id
      roomNumber
      status
    }
  }
`;
