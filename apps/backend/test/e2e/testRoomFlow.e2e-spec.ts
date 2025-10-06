import assert from "assert";
import { Kafka } from 'kafkajs';
import { describe, it } from "@jest/globals";

const GRAPHQL_ENDPOINT = "http://localhost:8080/graphql";
const ROOM_NUMBER = 101;

const resetRoomMutation = `
  mutation ResetRoom($roomNumber: Int!) {
    resetRoom(roomNumber: $roomNumber) {
      status
    }
  }
`;

interface GraphQLError {
  message: string;
  extensions?: { code?: string };
}

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: GraphQLError[];
}

const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');

async function testKafkaConnection() {
  const kafka = new Kafka({ clientId: 'test-client', brokers });
  const producer = kafka.producer();
  try {
    await producer.connect();
    console.log('✅ Kafka connection successful!');
    await producer.disconnect();
    return true;
  } catch (err) {
    console.error('❌ Kafka connection failed', err);
    return false;
  }
}

// --- Run Kafka test if this file is executed directly ---
if (require.main === module) {
  testKafkaConnection();
}

// --- Run mutation ---
async function runMutation<T = any>(
  query: string,
  variables = {}
): Promise<GraphQLResponse<T> | null> {
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) {
      console.error(`HTTP Error: ${res.status}`);
      return { errors: [{ message: `HTTP Error ${res.status}` }] };
    }
    return (await res.json()) as GraphQLResponse<T>;
  } catch (error: any) {
    console.error("Network Error:", error.message);
    return null;
  }
}

// --- Wait for GraphQL readiness ---
async function waitForGraphQLReadiness(roomNumber: number) {
  const maxRetries = 10;
  let delay = 500;

  for (let i = 0; i < maxRetries; i++) {
    console.log(`-- Readiness Check Attempt ${i + 1}/${maxRetries} --`);
    const result = await runMutation<{ resetRoom: { status: string } }>(
      resetRoomMutation,
      { roomNumber }
    );

    if (result === null) {
      console.log(`Server not reachable. Retrying in ${delay}ms...`);
    } else if (result.errors?.length) {
      const validationError = result.errors.find(
        (e) => e.extensions?.code === "GRAPHQL_VALIDATION_FAILED"
      );
      if (validationError) console.log("Schema not fully registered. Retrying...");
      else {
        console.error("Critical GraphQL Error:", result.errors);
        return false;
      }
    } else if (result.data) {
      console.log(`✅ Server is READY. Status: ${result.data.resetRoom.status}`);
      return true;
    }

    await new Promise((res) => setTimeout(res, delay));
    delay *= 1.5;
  }

  console.error("Failed to connect after max retries.");
  return false;
}

// --- Full E2E flow function ---
async function testRoomFlowE2EFull(roomNumber: number) {
  console.log("=== Room Flow E2E Full Test Start ===");

  const ready = await waitForGraphQLReadiness(roomNumber);
  if (!ready) assert.fail("Backend did not become ready for E2E testing.");

  console.log("\n--- Step 1: Reset Room Status ---");
  const result = await runMutation<{ resetRoom: { status: string } }>(
    resetRoomMutation,
    { roomNumber }
  );

  try {
    assert.strictEqual(
      result?.data?.resetRoom?.status,
      "READY",
      "Room should be READY after reset"
    );
    console.log(`✅ Room ${roomNumber} is READY.`);

    console.log("\n--- Full E2E Flow Test Complete ---");
  } catch (error) {
    console.error(`❌ Test failed: ${error}`);
    throw error;
  }
}

// --- Jest wrapper ---
describe("Room Flow E2E Tests", () => {
  it("should run full room flow E2E test", async () => {
    await testRoomFlowE2EFull(ROOM_NUMBER);
  });
});
