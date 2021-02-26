import { mockGlobal, mockInstanceOf } from "screeps-jest";
import { FunctionReturnCodes } from "../utils/constants/global";
import { RunCreep, Run } from "./loop";

JSON.stringify = jest.fn(() => {
  return "stringify";
});

jest.mock("../memory/stats");
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

describe("Creep loop", () => {
  describe("RunCreep method", () => {
    beforeEach(() => {
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
    it("should return OK", () => {
      const creep = mockInstanceOf<Creep>({ memory: {} });
      Game.creeps = { creep };

      const runCreep = RunCreep("creep");
      expect(runCreep.code === FunctionReturnCodes.OK).toBeTruthy();
    });
    it("should return NO_CONTENT", () => {
      Game.creeps = {};
      const runCreep = RunCreep("noCreep");
      expect(runCreep.code === FunctionReturnCodes.NO_CONTENT).toBeTruthy();
    });
  });
  describe("Run method", () => {
    it("should return NO_CONTENT", () => {
      mockGlobal<Memory>("Memory", { cache: { creeps: { data: {} } } }, true);

      const runCreep = Run("room");
      expect(runCreep.code === FunctionReturnCodes.NO_CONTENT).toBeTruthy();
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
      expect(run.code === FunctionReturnCodes.OK).toBeTruthy();

      Memory.cache.creeps.data = { roomName: [] };
      run = Run("roomName");
      expect(run.code === FunctionReturnCodes.OK).toBeTruthy();
    });
  });
});
