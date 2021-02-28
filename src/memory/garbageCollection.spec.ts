import { mockGlobal } from "screeps-jest";
import { FunctionReturnCodes } from "../utils/constants/global";
import { RemoveCreep, RemoveRoom, RemoveStructure } from "./garbageCollection";

// jest.mock("../utils/logger");
jest.mock("./stats");

beforeAll(() => {
  mockGlobal<Game>(
    "Game",
    {
      cpu: {
        getUsed: () => {
          return 1;
        },
      },
    },
    true
  );
});

describe("Garbage collection", () => {
  describe("RemoveCreep method", () => {
    it("should return OK", () => {
      mockGlobal<Memory>("Memory", {
        creeps: {},
        cache: { creeps: { data: { roomName: [{ id: "id" }] } } },
      });
      Memory.creeps.id = { commandRoom: "room" };

      let removeCreep = RemoveCreep("id", "roomName");
      expect(removeCreep.code).toBe(FunctionReturnCodes.OK);

      Memory.creeps.id = { commandRoom: "room" };
      removeCreep = RemoveCreep("id", "roomName");
      expect(removeCreep.code).toBe(FunctionReturnCodes.OK);

      removeCreep = RemoveCreep("id", "roomName");
      expect(removeCreep.code).toBe(FunctionReturnCodes.OK);
    });
  });
  describe("RemoveStructure method", () => {
    it("should return OK", () => {
      mockGlobal<Memory>("Memory", {
        structures: {},
        cache: { structures: { data: { roomName: [{ id: "id" }] } } },
      });
      Memory.structures.id = { room: "room" };

      let removeStructure = RemoveStructure("id", "roomName");
      expect(removeStructure.code).toBe(FunctionReturnCodes.OK);

      Memory.structures.id = { room: "room" };
      removeStructure = RemoveStructure("id", "roomName");
      expect(removeStructure.code).toBe(FunctionReturnCodes.OK);

      removeStructure = RemoveStructure("id", "roomName");
      expect(removeStructure.code).toBe(FunctionReturnCodes.OK);
    });
  });
  describe("RemoveRoom method", () => {
    it("should return OK", () => {
      mockGlobal<Memory>(
        "Memory",
        {
          structures: {},
          creeps: {},
          rooms: {},
          cache: {
            creeps: { data: {} },
            structures: { data: {} },
            rooms: { data: ["roomName"] },
          },
        },
        true
      );
      Memory.rooms.roomName = {};
      Memory.structures.id = { room: "roomName" };
      Memory.structures.id2 = { room: "roomName2" };
      Memory.creeps.id = { commandRoom: "roomName" };
      Memory.creeps.id2 = { commandRoom: "roomName2" };

      let removeRoom = RemoveRoom("roomName");
      expect(removeRoom.code).toBe(FunctionReturnCodes.OK);
      expect(Object.keys(Memory.rooms).length === 0).toBeTruthy();
      expect(Object.keys(Memory.structures).length === 1).toBeTruthy();
      expect(Object.keys(Memory.creeps).length === 1).toBeTruthy();

      Memory.rooms.roomName = {};
      removeRoom = RemoveRoom("roomName");
      expect(removeRoom.code).toBe(FunctionReturnCodes.OK);
    });
  });
});
