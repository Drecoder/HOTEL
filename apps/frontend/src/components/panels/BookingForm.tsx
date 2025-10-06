import React, { useState, type ChangeEvent, type FormEvent } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { useMutation } from "@apollo/client/react";
import { CHECK_IN } from "../../graphql/mutations/checkIn";

interface CheckInData {
  checkInRoom: {
    id: number;
    roomNumber: number;
    status: string;
  };
}

interface CheckInVars {
  bookingId: number;
  roomNumber: number;
}

interface BookingFormProps {
  onCompleted?: (data: CheckInData["checkInRoom"]) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ onCompleted }) => {
  const [bookingId, setBookingId] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  const [checkIn, { loading }] = useMutation<CheckInData, CheckInVars>(CHECK_IN, {
    onCompleted: (data) => {
      onCompleted?.(data.checkInRoom);
      setBookingId("");
      setRoomNumber("");
    },
    onError: (err) => alert(err.message),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!bookingId || !roomNumber) return alert("Enter booking ID and room number");
    checkIn({ variables: { bookingId: parseInt(bookingId), roomNumber: parseInt(roomNumber) } });
  };

  return (
    <form className="flex flex-col gap-4 p-6 bg-orange-50 border-2 border-orange-200 rounded-2xl shadow-lg" onSubmit={handleSubmit}>
      <Input type="number" placeholder="Booking ID" value={bookingId} onChange={(e: ChangeEvent<HTMLInputElement>) => setBookingId(e.target.value)} />
      <Input type="number" placeholder="Room Number" value={roomNumber} onChange={(e: ChangeEvent<HTMLInputElement>) => setRoomNumber(e.target.value)} />
      <Button type="submit" disabled={loading}>
        {loading ? "Checking In..." : "Check In"}
      </Button>
    </form>
  );
};

export default BookingForm;
