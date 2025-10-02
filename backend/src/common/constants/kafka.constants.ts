/**
 * Kafka Topic Definitions for the hotel_ops system.
 * Using 'as const' enforces immutability and precise type-safety.
 */
export const KAFKA_TOPICS = {
  // Topic for signaling that a room is clean and ready for a new guest
  ROOM_READY_EVENT: 'hotel_ops.operations.room_ready',
  
  // You can include other topics here as the system grows
  // ROOM_CHECK_IN: 'hotel_ops.operations.check_in',
} as const;