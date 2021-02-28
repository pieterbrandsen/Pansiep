import { mockGlobal, mockInstanceOf } from "screeps-jest";
import {
  ResetPreProcessingRoomStats,
  ResetPreProcessingStats,
} from "../memory/stats";
import { FunctionReturnCodes } from "../utils/constants/global";
import { RunCreep, Run } from "./loop";

JSON.stringify = jest.fn(() => {
  return "stringify";
});

jest.mock("../memory/initialization", () => {
  return {
    IsCreepMemoryInitialized: (val: string) => {
      if (val.includes("noMem")) {
        return { code: FunctionReturnCodes.NO_CONTENT };
      }

      return { code: FunctionReturnCodes.OK };
    },
  };
});

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
  ResetPreProcessingStats();
});

describe("Creep loop", () => {
  describe("RunCreep method", () => {
    it("should return OK", () => {
      const creep = mockInstanceOf<Creep>({
        memory: {},
        room: { name: "room" },
      });
      ResetPreProcessingRoomStats(creep.room.name);
      Game.creeps = { creep };

      const runCreep = RunCreep("creep");
      expect(runCreep.code).toBe(FunctionReturnCodes.OK);
    });
    it("should return NO_CONTENT", () => {
      Game.creeps = {};
      const runCreep = RunCreep("noCreep");
      expect(runCreep.code).toBe(FunctionReturnCodes.NO_CONTENT);
    });
  });
  describe("Run method", () => {
    it("should return NO_CONTENT", () => {
      mockGlobal<Memory>("Memory", { cache: { creeps: { data: {} } } }, true);

      const runCreep = Run("room");
      expect(runCreep.code).toBe(FunctionReturnCodes.NO_CONTENT);
    });

    it("should return OK", () => {
      mockGlobal<Memory>("Memory", { cache: { creeps: { data: {} } } });
      const creeps = [
        { creepType: "None", id: "noMem1" },
        { creepType: "None", id: "1" },
        { creepType: "None", id: "2" },
      ];

      Memory.cache.creeps.data = { roomName: creeps };

      let run = Run("roomName");
      expect(run.code).toBe(FunctionReturnCodes.OK);

      Memory.cache.creeps.data = { roomName: [] };
      run = Run("roomName");
      expect(run.code).toBe(FunctionReturnCodes.OK);
    });
  });
});
