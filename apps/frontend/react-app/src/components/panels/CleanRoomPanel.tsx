import React, { useState, type ChangeEvent, type FormEvent } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { useMutation } from "@apollo/client";
import { CLEAN_ROOM } from "../../graphql/mutations/cleanRoom.ts";

interface CleanRoomPanelProps {
  onCompleted?: (data: any) => void;
}

const CleanRoomPanel: React.FC<CleanRoomPanelProps> = ({ onCompleted }) => {
  const [roomNumber, setRoomNumber] = useState("");

  const [cleanRoom, { loading }] = useMutation(CLEAN_ROOM, {
    onCompleted: (data) => {
      onCompleted?.(data.cleanRoom);
      setRoomNumber("");
    },
    onError: (err) => alert(err.message),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!roomNumber) return alert("Enter room number");
    cleanRoom({ variables: { roomNumber: parseInt(roomNumber) } });
  };

  return (
    <form
      className="flex flex-col gap-4 p-6 bg-green-50 border-2 border-green-200 rounded-2xl shadow-lg"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-green-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <h2 className="text-lg font-bold text-green-700">Mark Clean</h2>
      </div>
      <Input
        type="number"
        placeholder="Room Number"
        value={roomNumber}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setRoomNumber(e.target.value)}
      />
      <Button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition">
        {loading ? "Cleaning..." : "Mark Clean"}
      </Button>
    </form>
  );
};

export default CleanRoomPanel;