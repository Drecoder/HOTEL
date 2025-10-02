import { useState } from "react";
import Card from "../components/layout/Card";
import Section from "../components/layout/Section";
import RoomList from "../components/RoomList";
import BookingForm from "../components/panels/BookingForm";
import CheckOutPanel from "../components/panels/CheckOutPanel";
import CleanRoomPanel from "../components/panels/CleanRoomPanel";

export type Room = {
  id: string;
  roomNumber: string;
  status: "READY" | "OCCUPIED" | "DIRTY" | "CLEANING" | "MAINTENANCE";
  expectedCheckout?: string;
};

const initialRooms: Room[] = [
  { id: "101", roomNumber: "101", status: "OCCUPIED", expectedCheckout: "2025-10-03T23:53:06" },
  { id: "201", roomNumber: "201", status: "READY" },
  { id: "104", roomNumber: "104", status: "OCCUPIED", expectedCheckout: "2025-10-06T23:53:06" },
  { id: "102", roomNumber: "102", status: "READY" },
  { id: "103", roomNumber: "103", status: "READY" },
];

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [rooms, setRooms] = useState<Room[]>(initialRooms);

  // Update room status after mutation completes
  const handleCheckIn = (updatedRoom: Room) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.roomNumber === updatedRoom.roomNumber ? updatedRoom : room
      )
    );
  };
  const handleCheckOut = (updatedRoom: Room) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.roomNumber === updatedRoom.roomNumber ? updatedRoom : room
      )
    );
  };
  const handleCleanRoom = (updatedRoom: Room) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.roomNumber === updatedRoom.roomNumber ? updatedRoom : room
      )
    );
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.roomNumber.includes(search);
    const matchesStatus = statusFilter === "ALL" ? true : room.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRooms = rooms.length;
  const occupied = rooms.filter((r) => r.status === "OCCUPIED").length;
  const dirty = rooms.filter((r) => r.status === "DIRTY").length;
  const ready = rooms.filter((r) => r.status === "READY").length;

  const summaryColors: Record<string, string> = {
    total: "bg-gray-100 text-gray-900",
    occupied: "bg-blue-100 text-blue-800",
    dirty: "bg-red-100 text-red-800",
    ready: "bg-green-100 text-green-800",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center pt-12 space-y-6">
      <Card className="w-full max-w-4xl mx-auto p-6">
        <Section title="Hotel Dashboard">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
            <div className={`rounded-2xl shadow-md p-4 text-center ${summaryColors.total}`}>
              <div className="text-sm font-medium">Total Rooms</div>
              <div className="text-2xl font-bold mt-1">{totalRooms}</div>
            </div>
            <div className={`rounded-2xl shadow-md p-4 text-center ${summaryColors.occupied}`}>
              <div className="text-sm font-medium">Occupied</div>
              <div className="text-2xl font-bold mt-1">{occupied}</div>
            </div>
            <div className={`rounded-2xl shadow-md p-4 text-center ${summaryColors.dirty}`}>
              <div className="text-sm font-medium">Dirty</div>
              <div className="text-2xl font-bold mt-1">{dirty}</div>
            </div>
            <div className={`rounded-2xl shadow-md p-4 text-center ${summaryColors.ready}`}>
              <div className="text-sm font-medium">Ready</div>
              <div className="text-2xl font-bold mt-1">{ready}</div>
            </div>
          </div>
        </Section>

        {/* Action Panels */}
        <Section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <BookingForm onCompleted={handleCheckIn} />
            <CheckOutPanel onCompleted={handleCheckOut} />
            <CleanRoomPanel onCompleted={handleCleanRoom} />
          </div>
        </Section>

        <Section>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search by room number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
            >
              <option value="ALL">All Statuses</option>
              <option value="READY">Ready</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="DIRTY">Dirty</option>
              <option value="CLEANING">Cleaning</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>

          <RoomList rooms={filteredRooms} />
        </Section>
      </Card>
    </div>
  );
}