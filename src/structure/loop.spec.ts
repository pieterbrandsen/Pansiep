import { mockGlobal, mockInstanceOf } from "screeps-jest";
import { RunStructure, Run } from "./loop";
import { FunctionReturnCodes } from "../utils/constants/global";

JSON.stringify = jest.fn(() => {
  return "stringify";
});

jest.mock("../memory/stats");
jest.mock("../memory/initialization", () => {
  return {
    IsStructureMemoryInitialized: (val: string) => {
      if (val.includes("noMem")) {
        return { code: FunctionReturnCodes.NO_CONTENT };
      }

      return { code: FunctionReturnCodes.OK };
    },
  };
});

describe("Structure loop", () => {
  describe("RunStructure method", () => {
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
      const structure = mockInstanceOf<Structure>({ memory: {} });
      Game.structures = { structure };

      const runStructure = RunStructure("structure");
      expect(runStructure.code).toBe(FunctionReturnCodes.OK);
    });
    it("should return NO_CONTENT", () => {
      Game.structures = {};
      const runStructure = RunStructure("structure");
      expect(runStructure.code).toBe(FunctionReturnCodes.NO_CONTENT);
    });
  });
  describe("Run method", () => {
    it("should return NO_CONTENT", () => {
      mockGlobal<Memory>(
        "Memory",
        { cache: { structures: { data: {} } } },
        true
      );

      const runStructure = Run("structure");
      expect(runStructure.code).toBe(FunctionReturnCodes.NO_CONTENT);
    });

    it("should return OK", () => {
      mockGlobal<Memory>("Memory", { cache: { structures: { data: {} } } });
      const structures = [
        { structureType: STRUCTURE_LINK, id: "noMem0" },
        { structureType: STRUCTURE_LINK, id: "1" },
        { structureType: STRUCTURE_CONTROLLER, id: "2" },
      ];

      Memory.cache.structures.data = { roomName: structures };

      let run = Run("roomName");
      expect(run.code).toBe(FunctionReturnCodes.OK);

      Memory.cache.structures.data = { roomName: [] };
      run = Run("roomName");
      expect(run.code).toBe(FunctionReturnCodes.OK);
    });
  });
});
