import { gql } from "@apollo/client";

export const CHECK_OUT = gql`
  mutation CheckOut($roomNumber: Int!) {
    checkOut(roomNumber: $roomNumber) {
      id
      roomNumber
      status
    }
  }
`;
