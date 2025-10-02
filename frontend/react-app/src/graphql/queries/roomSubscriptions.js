import { gql } from "@apollo/client";
import { ROOM_FRAGMENT } from "../fragments/roomFragments";

export const ROOM_STATUS_UPDATED = gql`
  subscription OnRoomStatusUpdated {
    roomStatusUpdated {
      ...RoomFields
    }
  }
  ${ROOM_FRAGMENT}
`;
