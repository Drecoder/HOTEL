import { gql } from "@apollo/client";
import { ROOM_FRAGMENT } from "../fragments/roomFragments";

export const GET_ROOMS = gql`
  query GetRooms {
    rooms {
      ...RoomFields
    }
  }
  ${ROOM_FRAGMENT}
`;
