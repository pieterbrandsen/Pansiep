import { mockGlobal } from "screeps-jest";
import {
  AssignCommandsToHeap,
  DeleteCreepMemoryCommand,
  DeleteRoomMemoryCommand,
  DeleteStructureMemoryCommand,
  DescribeFunction,
  HelpCommand,
  ResetCreepMemoryCommand,
  ResetGlobalMemoryCommand,
  ResetRoomMemoryCommand,
  ResetStructureMemoryCommand,
} from "./consoleCommands";
import { FunctionReturnCodes } from "./constants/global";

jest.mock("../memory/initialization", () => {
  return {
    InitializeGlobalMemory: jest.fn().mockReturnValue({ code: 200 }),
    InitializeRoomMemory: jest.fn().mockReturnValue({ code: 200 }),
    InitializeStructureMemory: jest.fn().mockReturnValue({ code: 200 }),
    InitializeCreepMemory: jest.fn().mockReturnValue({ code: 200 }),
  };
});
jest.mock("../memory/garbageCollection", () => {
  return {
    RemoveRoom: jest.fn().mockReturnValue({ code: 200 }),
    RemoveStructure: jest.fn().mockReturnValue({ code: 200 }),
    RemoveCreep: jest.fn().mockReturnValue({ code: 200 }),
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

describe("Console commands", () => {
  describe("DescribeFunction method", () => {
    it("should return OK", () => {
      let describeFunction = DescribeFunction("funcName", "funcDescription");
      expect(describeFunction.code).toBe(FunctionReturnCodes.OK);

      describeFunction = DescribeFunction("funcName", "funcDescription", [
        { name: "a", type: "number" },
        { name: "b", type: "string" },
      ]);
      expect(describeFunction.code).toBe(FunctionReturnCodes.OK);
    });
  });

  describe("ResetGlobalMemoryCommand method", () => {
    it("should return OK", () => {
      const resetGlobalMemoryCommand = ResetGlobalMemoryCommand();
      expect(resetGlobalMemoryCommand === FunctionReturnCodes.OK).toBeTruthy();
    });
  });

  describe("ResetRoomMemoryCommand method", () => {
    it("should return OK", () => {
      const resetRoomMemoryCommand = ResetRoomMemoryCommand("roomName");
      expect(resetRoomMemoryCommand === FunctionReturnCodes.OK).toBeTruthy();
    });
  });

  describe("ResetStructureMemoryCommand method", () => {
    it("should return OK", () => {
      const resetStructureMemoryCommand = ResetStructureMemoryCommand(
        "id",
        "roomName"
      );
      expect(
        resetStructureMemoryCommand === FunctionReturnCodes.OK
      ).toBeTruthy();
    });
  });

  describe("ResetCreepMemoryCommand method", () => {
    it("should return OK", () => {
      const resetCreepMemoryCommand = ResetCreepMemoryCommand("id", "roomName");
      expect(resetCreepMemoryCommand === FunctionReturnCodes.OK).toBeTruthy();
    });
  });

  describe("DeleteRoomMemoryCommand method", () => {
    it("should return OK", () => {
      const deleteRoomMemoryCommand = DeleteRoomMemoryCommand("id");
      expect(deleteRoomMemoryCommand === FunctionReturnCodes.OK).toBeTruthy();
    });
  });

  describe("DeleteStructureMemoryCommand method", () => {
    it("should return OK", () => {
      const deleteStructureMemoryCommand = DeleteStructureMemoryCommand(
        "id",
        "roomName"
      );
      expect(
        deleteStructureMemoryCommand === FunctionReturnCodes.OK
      ).toBeTruthy();
    });
  });

  describe("DeleteCreepMemoryCommand method", () => {
    it("should return OK", () => {
      const deleteCreepMemoryCommand = DeleteCreepMemoryCommand(
        "id",
        "roomName"
      );
      expect(deleteCreepMemoryCommand === FunctionReturnCodes.OK).toBeTruthy();
    });
  });
  describe("HelpCommand method", () => {
    it("should return string", () => {
      const helpCommand = HelpCommand();
      expect(typeof helpCommand).toBe("string");
    });
  });
  describe("AssignCommandsToHeap", () => {
    it("should return OK and have methods assigned to heap", () => {
      const assignCommandsToHeap = AssignCommandsToHeap();
      expect(assignCommandsToHeap.code).toBe(FunctionReturnCodes.OK);

      expect(global.help).toBeTruthy();
      expect(global.resetGlobalMemory).toBeTruthy();
      expect(global.resetRoomMemory).toBeTruthy();
      expect(global.resetCreepMemory).toBeTruthy();
      expect(global.deleteRoomMemory).toBeTruthy();
      expect(global.deleteCreepMemory).toBeTruthy();
    });
  });
});
