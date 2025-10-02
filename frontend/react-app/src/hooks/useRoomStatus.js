// src/hooks/useRoomStatus.js
import { useState, useEffect, useCallback } from "react";
import { useQuery, useSubscription } from "@apollo/client";
import { GET_ROOMS } from "../graphql/queries/getRooms";
import { ROOM_STATUS_UPDATED } from "../graphql/queries/roomSubscriptions";

export const useRoomStatus = () => {
  const [rooms, setRooms] = useState([]);

  // 1️⃣ Fetch initial rooms
  const { data, loading, error } = useQuery(GET_ROOMS, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data?.rooms) {
      setRooms(data.rooms);
    }
  }, [data]);

  // 2️⃣ Subscribe to room status updates
  useSubscription(ROOM_STATUS_UPDATED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const updatedRoom = subscriptionData.data?.roomStatusUpdated;
      if (!updatedRoom) return;

      setRooms((prev) =>
        prev.map((r) => (r.id === updatedRoom.id ? updatedRoom : r))
      );
    },
  });

  // 3️⃣ Optional: updater function for manual updates
  const updateRoom = useCallback((updatedRoom) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === updatedRoom.id ? updatedRoom : r))
    );
  }, []);

  return { rooms, loading, error, updateRoom };
};
