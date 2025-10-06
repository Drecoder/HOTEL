import React, { useEffect, useMemo, useState } from "react";
import BookingForm from "../components/panels/BookingForm";
import CheckOutPanel from "../components/panels/CheckOutPanel";
import CleanRoomPanel from "../components/panels/CleanRoomPanel";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useUIStore } from "../store/uiStore";

export interface Room {
  id: number;
  roomNumber: number;
  status: "READY" | "OCCUPIED" | "DIRTY" | "CLEANING" | "MAINTENANCE";
  expectedCheckout?: string;
}

export const GET_ROOMS = gql`
  query GetRooms {
    rooms {
      id
      roomNumber
      status
      expectedCheckout
    }
  }
`;

// Use the Marriott image or your own custom background
const backgroundImageUrl =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"; // replace with your preferred image

const Dashboard: React.FC = () => {
  const { rooms, setRooms } = useUIStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Room["status"] | "ALL">("ALL");
  const { data, loading, error, refetch } = useQuery<{ rooms: Room[] }>(GET_ROOMS);

  useEffect(() => {
    if (data?.rooms) {
      setRooms(data.rooms);
    }
  }, [data, setRooms]);

  const handlePanelUpdate = () => {
    refetch();
  };

  const stats = useMemo(() => {
    const total = rooms.length;
    const occupied = rooms.filter(r => r.status === "OCCUPIED").length;
    const dirty = rooms.filter(r => r.status === "DIRTY").length;
    const ready = rooms.filter(r => r.status === "READY").length;
    return { total, occupied, dirty, ready };
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesSearch = room.roomNumber.toString().includes(search);
      const matchesStatus = statusFilter === "ALL" || room.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rooms, search, statusFilter]);

  if (loading) return <p>Loading rooms...</p>;
  if (error) return <p>Error loading rooms: {error.message}</p>;

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center bg-gray-200 overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      {/* Main dashboard card */}
      <div className="relative z-10 w-full max-w-5xl mx-auto rounded-3xl bg-white bg-opacity-95 shadow-2xl p-10 flex flex-col space-y-8">
        <h1 className="text-4xl font-extrabold text-orange-600 mb-2 text-center tracking-tight">
          Hotel Dashboard
        </h1>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="rounded-2xl shadow-lg p-7 text-center bg-gradient-to-r from-orange-100 to-orange-200 text-orange-900">
            <h2 className="text-lg font-semibold mb-2">Total Rooms</h2>
            <p className="text-3xl font-extrabold">{stats.total}</p>
          </div>
          <div className="rounded-2xl shadow-lg p-7 text-center bg-gradient-to-r from-blue-400 to-blue-600 text-white">
            <h2 className="text-lg font-semibold mb-2">Occupied</h2>
            <p className="text-3xl font-extrabold">{stats.occupied}</p>
          </div>
          <div className="rounded-2xl shadow-lg p-7 text-center bg-gradient-to-r from-red-400 to-red-600 text-white">
            <h2 className="text-lg font-semibold mb-2">Dirty</h2>
            <p className="text-3xl font-extrabold">{stats.dirty}</p>
          </div>
          <div className="rounded-2xl shadow-lg p-7 text-center bg-gradient-to-r from-green-400 to-green-600 text-white">
            <h2 className="text-lg font-semibold mb-2">Ready</h2>
            <p className="text-3xl font-extrabold">{stats.ready}</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
          <input
            type="text"
            placeholder="Search by room number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-4 border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 transition placeholder-orange-400 font-semibold"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Room["status"] | "ALL")}
            className="p-4 border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 transition font-semibold"
          >
            <option value="ALL">All Statuses</option>
            <option value="READY">Ready</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="DIRTY">Dirty</option>
            <option value="CLEANING">Cleaning</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>

        {/* Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <BookingForm onCompleted={handlePanelUpdate} />
          <CheckOutPanel onCompleted={handlePanelUpdate} />
          <CleanRoomPanel onCompleted={handlePanelUpdate} />
        </div>

        {/* Room List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl shadow-lg p-7 hover:shadow-xl transition-shadow duration-200 flex flex-col justify-between border-2 border-gray-100"
            >
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Room {room.roomNumber}</h3>
                <span
                  className={`inline-block px-4 py-1 mt-3 rounded-full text-sm font-semibold ${
                    room.status === "READY"
                      ? "bg-green-100 text-green-900"
                      : room.status === "DIRTY"
                      ? "bg-red-100 text-red-900"
                      : room.status === "MAINTENANCE"
                      ? "bg-yellow-100 text-yellow-900"
                      : room.status === "OCCUPIED"
                      ? "bg-blue-100 text-blue-900"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  {room.status}
                </span>
                {room.expectedCheckout && (
                  <p className="text-gray-500 mt-2 text-sm font-semibold">
                    Checkout: {new Date(room.expectedCheckout).toLocaleString()}
                  </p>
                )}
              </div>
              <button className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition">
                Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;