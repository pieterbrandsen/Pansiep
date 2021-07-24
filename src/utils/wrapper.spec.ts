import { mockGlobal, mockInstanceOf } from "screeps-jest";
import MemoryInitializationHandler from "../memory/initialization";
import WrapperHandler from "./wrapper";

console.log = jest.fn();

beforeAll(() => {
  mockGlobal<Memory>("Memory", {});
  mockGlobal<Game>(
    "Game",
    {
      rooms: {},
      structures: {},
      creeps: {},
      cpu: {
        getUsed: jest.fn().mockReturnValue(0),
      },
    },
    true
  );
});
const mockFunc = jest.fn().mockReturnValue(0);
const creep = mockInstanceOf<Creep>({});
describe("WrapperHandler", () => {
  describe("FuncWrapper", () => {
    beforeEach(() => {
      mockFunc.mockClear();
      MemoryInitializationHandler.InitializeHeapVars();
    });
    it("should call the function", () => {
      WrapperHandler.FuncWrapper(mockFunc)();
      WrapperHandler.FuncWrapper(mockFunc)();
      expect(mockFunc).toHaveBeenCalled();
    });
    it("should have pre processingStats defined", () => {
      WrapperHandler.FuncWrapper(mockFunc)();
      expect(mockFunc).toHaveBeenCalled();
      expect(global.preProcessingStats.funcCalls[mockFunc.name]).toBeDefined();
    });
  });
  describe("IntentWrapper", () => {
    beforeEach(() => {
      mockFunc.mockClear();
      MemoryInitializationHandler.InitializeHeapVars();
    });
    it("should call the function", () => {
      WrapperHandler.IntentWrapper(creep, "move", mockFunc);
      creep.move(1);
      expect(mockFunc).toHaveBeenCalled();
    });
    it("should have pre processingStats defined", () => {
      WrapperHandler.IntentWrapper(creep, "move", mockFunc);
      creep.move(1);
      expect(mockFunc).toHaveBeenCalled();
      expect(global.preProcessingStats.intentCalls.move).toBeDefined();

      creep.move(1);
    });
  });
});
