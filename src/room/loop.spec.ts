import { mockGlobal, mockInstanceOf } from "screeps-jest";
import { FunctionReturnCodes } from "../utils/constants/global";
import { RunRoom, Run } from "./loop";

jest.mock("./visuals");
jest.mock("../memory/stats");
jest.mock("../structure/loop");
jest.mock("../creep/loop");
jest.mock("../memory/stats");
jest.mock("../memory/initialization", () => {
  return {
    IsRoomMemoryInitialized: (val: string) => {
      if (val.includes("noMem")) {
        return { code: FunctionReturnCodes.NO_CONTENT };
      }

      return { code: FunctionReturnCodes.OK };
    },
  };
});

describe("Room loop", () => {
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
  describe("RunRoom method", () => {
    it("should return OK", () => {
      const room = mockInstanceOf<Room>({ name: "room" });
      Game.rooms = { room };
      const runRoom = RunRoom("room");
      expect(runRoom.code).toBe(FunctionReturnCodes.OK);
    });
    it("should return NO_CONTENT", () => {
      Game.rooms = {};
      const runRoom = RunRoom("room");
      expect(runRoom.code).toBe(FunctionReturnCodes.NO_CONTENT);
    });
  });
  describe("Run method", () => {
    it("should return OK", () => {
      mockGlobal<Memory>("Memory", { cache: { rooms: { data: [] } } });
      const rooms = ["noMem1", "2", "3"];

      Game.rooms = {};
      Memory.cache.rooms.data = rooms;

      let run = Run();
      expect(run.code).toBe(FunctionReturnCodes.OK);

      Memory.cache.rooms.data = [];
      run = Run();
      expect(run.code).toBe(FunctionReturnCodes.OK);
    });
  });
});
