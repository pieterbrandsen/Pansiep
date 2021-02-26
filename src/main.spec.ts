import { mockGlobal } from "screeps-jest";
import { loop as Loop } from "./main";
import { FunctionReturnCodes } from "./utils/constants/global";

jest.mock("./room/loop");
jest.mock("./memory/updateCache");
jest.mock("./memory/initialization", () => {
  return {
    AreCustomPrototypesInitialized: jest
      .fn()
      .mockReturnValueOnce({ code: 204 })
      .mockReturnValueOnce({ code: 204 })
      .mockReturnValueOnce({ code: 204 })
      .mockReturnValue({ code: 200 }),
    AreHeapVarsValid: jest
      .fn()
      .mockReturnValueOnce({ code: 204 })
      .mockReturnValueOnce({ code: 204 })
      .mockReturnValueOnce({ code: 204 })
      .mockReturnValue({ code: 200 }),
    IsGlobalMemoryInitialized: jest
      .fn()
      .mockReturnValueOnce({ code: 204 })
      .mockReturnValueOnce({ code: 204 })
      .mockReturnValueOnce({ code: 204 })
      .mockReturnValue({ code: 200 }),
    InitializeCustomPrototypes: jest.fn(),
    InitializeHeapVars: jest.fn(),
    InitializeGlobalMemory: jest.fn(),
  };
});
jest.mock("./memory/stats", () => {
  return {
    GlobalStatsPreProcessing: jest
      .fn()
      .mockReturnValueOnce({ code: 204 })
      .mockReturnValue({ code: 200 }),
    GlobalStats: jest.fn(),
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
});

describe("Main loop", () => {
  describe("Loop method", () => {
    it("should return NOT_MODIFIED", () => {
      let loop = Loop();
      expect(loop.code === FunctionReturnCodes.NOT_MODIFIED).toBeTruthy();

      loop = Loop();
      expect(loop.code === FunctionReturnCodes.NOT_MODIFIED).toBeTruthy();

      loop = Loop();
      expect(loop.code === FunctionReturnCodes.NOT_MODIFIED).toBeTruthy();
      Loop();
    });
    it("should return OK", () => {
      const loop = Loop();
      expect(loop.code === FunctionReturnCodes.OK).toBeTruthy();
    });
  });
});
