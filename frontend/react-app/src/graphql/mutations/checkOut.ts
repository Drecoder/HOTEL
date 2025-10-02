import { gql } from "@apollo/client";

export const CHECK_OUT = gql`
  mutation CheckOut($roomNumber: Int!) {
    checkOutRoom(roomNumber: $roomNumber) {
      id
      roomNumber
      status
    }
  }
`;
