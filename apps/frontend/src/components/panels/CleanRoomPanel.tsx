import React, { useState, type ChangeEvent, type FormEvent } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { useMutation } from "@apollo/client/react";
import { CLEAN_ROOM } from "../../graphql/mutations/cleanRoom";

interface CleanRoomData {
  cleanRoom: { roomNumber: number; status: string };
}

interface CleanRoomVars {
  roomNumber: number;
}

interface CleanRoomPanelProps {
  onCompleted?: (data: CleanRoomData["cleanRoom"]) => void;
}

const CleanRoomPanel: React.FC<CleanRoomPanelProps> = ({ onCompleted }) => {
  const [roomNumber, setRoomNumber] = useState("");

  const [cleanRoom, { loading }] = useMutation<CleanRoomData, CleanRoomVars>(CLEAN_ROOM, {
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
    <form className="flex flex-col gap-4 p-6 bg-green-50 border-2 border-green-200 rounded-2xl shadow-lg" onSubmit={handleSubmit}>
      <Input type="number" placeholder="Room Number" value={roomNumber} onChange={(e: ChangeEvent<HTMLInputElement>) => setRoomNumber(e.target.value)} />
      <Button type="submit" disabled={loading}>
        {loading ? "Cleaning..." : "Mark Clean"}
      </Button>
    </form>
  );
};

export default CleanRoomPanel;
