import { gql } from "@apollo/client";
import { ROOM_FRAGMENT } from "../fragments/roomFragments";
import type { Room } from "../../types/graphql";

// Type-safe GraphQL subscription
export type RoomStatusUpdatedData = {
  roomStatusUpdated: Room;
};

export const ROOM_STATUS_UPDATED = gql`
  subscription OnRoomStatusUpdated {
    roomStatusUpdated {
      ...RoomFields
    }
  }
  ${ROOM_FRAGMENT}
`;
