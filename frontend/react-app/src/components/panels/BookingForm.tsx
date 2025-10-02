import React, { useState, type ChangeEvent, type FormEvent } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { useMutation } from "@apollo/client";
import { CHECK_IN } from "../../graphql/mutations/checkIn";

interface BookingFormProps {
  onCompleted?: (data: any) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ onCompleted }) => {
  const [bookingId, setBookingId] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  const [checkIn, { loading }] = useMutation(CHECK_IN, {
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
    <form
      className="flex flex-col gap-4 p-6 bg-orange-50 border-2 border-orange-200 rounded-2xl shadow-lg"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-orange-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 11V3m0 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
        </span>
        <h2 className="text-lg font-bold text-orange-700">Check In</h2>
      </div>
      <Input
        type="number"
        placeholder="Booking ID"
        value={bookingId}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setBookingId(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Room Number"
        value={roomNumber}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setRoomNumber(e.target.value)}
      />
      <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg transition">
        {loading ? "Checking In..." : "Check In"}
      </Button>
    </form>
  );
};

export default BookingForm;