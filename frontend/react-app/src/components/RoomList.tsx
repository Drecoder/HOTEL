// src/components/RoomList.tsx
import React from "react";
import type { Room } from "../pages/Dashboard";

interface RoomListProps {
  rooms?: Room[];
}

const statusColors: Record<Room["status"], string> = {
  READY: "bg-green-200 text-green-800",
  OCCUPIED: "bg-yellow-200 text-yellow-800",
  DIRTY: "bg-red-200 text-red-800",
  CLEANING: "bg-blue-200 text-blue-800",
  MAINTENANCE: "bg-gray-200 text-gray-800",
};

const RoomList: React.FC<RoomListProps> = ({ rooms = [] }) => {
  if (rooms.length === 0) return <div>No rooms found.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {rooms.map((room) => (
        <div
          key={room.id}
          className="p-4 rounded shadow border flex flex-col justify-between"
        >
          <div className="text-lg font-semibold">Room {room.roomNumber}</div>
          <div
            className={`mt-2 px-2 py-1 rounded text-sm font-medium ${
              statusColors[room.status] ?? "bg-gray-100 text-gray-800"
            }`}
          >
            {room.status}
          </div>
          {room.expectedCheckout && (
            <div className="mt-1 text-sm text-gray-600">
              Checkout: {new Date(room.expectedCheckout).toLocaleString()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RoomList;
