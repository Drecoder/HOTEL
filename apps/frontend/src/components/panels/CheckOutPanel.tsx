import React, { useState, type ChangeEvent, type FormEvent } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { useMutation } from "@apollo/client/react";
import { CHECK_OUT } from "../../graphql/mutations/checkOut.ts";

interface CheckOutPanelProps {
  onCompleted?: (data: any) => void;
}

const CheckOutPanel: React.FC<CheckOutPanelProps> = ({ onCompleted }) => {
  const [roomNumber, setRoomNumber] = useState("");

  const [checkOut, { loading }] = useMutation(CHECK_OUT, {
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
    <form
      className="flex flex-col gap-4 p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl shadow-lg"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-blue-500">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7"
            />
          </svg>
        </span>
        <h2 className="text-lg font-bold text-blue-700">Check Out</h2>
      </div>
      <Input
        type="number"
        placeholder="Room Number"
        value={roomNumber}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setRoomNumber(e.target.value)
        }
      />
      <Button
        type="submit"
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition"
      >
        {loading ? "Checking Out..." : "Check Out"}
      </Button>
    </form>
  );
};

export default CheckOutPanel;
