import React, { useState, type ChangeEvent, type FormEvent } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { useMutation } from "@apollo/client/react";
import { CHECK_OUT } from "../../graphql/mutations/checkOut";

interface CheckOutData {
  checkOut: { roomNumber: number; status: string };
}

interface CheckOutVars {
  roomNumber: number;
}

interface CheckOutPanelProps {
  onCompleted?: (data: CheckOutData["checkOut"]) => void;
}

const CheckOutPanel: React.FC<CheckOutPanelProps> = ({ onCompleted }) => {
  const [roomNumber, setRoomNumber] = useState("");

  const [checkOut, { loading }] = useMutation<CheckOutData, CheckOutVars>(CHECK_OUT, {
    onCompleted: (data) => {
      onCompleted?.(data.checkOut);
      setRoomNumber("");
    },
    onError: (err) => alert(err.message),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!roomNumber) return alert("Enter room number");
    checkOut({ variables: { roomNumber: parseInt(roomNumber) } });
  };

  return (
    <form className="flex flex-col gap-4 p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl shadow-lg" onSubmit={handleSubmit}>
      <Input type="number" placeholder="Room Number" value={roomNumber} onChange={(e: ChangeEvent<HTMLInputElement>) => setRoomNumber(e.target.value)} />
      <Button type="submit" disabled={loading}>
        {loading ? "Checking Out..." : "Check Out"}
      </Button>
    </form>
  );
};

export default CheckOutPanel;
