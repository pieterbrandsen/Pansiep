import { mockGlobal } from "screeps-jest";
import { FunctionReturnCodes } from "./constants/global";
import { FuncWrapper, IntentWrapper, WrapFunctions } from "./wrapper";
import { FunctionReturnHelper } from "./statusGenerator";

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

  global.preProcessingStats = {
    funcCalls: {},
    intentCalls: {},
    rooms: {},
    ticksStatsCollecting: 0,
  };
});

describe("Wrapper", () => {
  describe("FuncWrapper method", () => {
    it("should return OK", () => {
      const wrappedFunc = FuncWrapper(() => {
        return FunctionReturnHelper(FunctionReturnCodes.OK);
      })();
      expect(wrappedFunc.code === FunctionReturnCodes.OK).toBeTruthy();
      FuncWrapper(() => {
        return FunctionReturnHelper(FunctionReturnCodes.OK);
      })();
    });
    it("should return INTERNAL_SERVER_ERROR", () => {
      const originalConsoleLog = console.log;
      console.log = jest.fn();
      const wrappedFunc = FuncWrapper(function throwFunc(): FunctionReturn {
        throw new Error("");
      })();
      console.log = originalConsoleLog;
      expect(
        wrappedFunc.code === FunctionReturnCodes.INTERNAL_SERVER_ERROR
      ).toBeTruthy();
    });
  });
  describe("WrapFunctions method", () => {
    it("should execute without error", () => {
      const { a, b } = WrapFunctions({
        a: jest.fn(),
        b: jest.fn(),
      });

      expect(a).toBeDefined();
      expect(b).toBeDefined();

      a();
      b();
    });
  });
  describe("IntentWrapper method", () => {
    it("should return OK", () => {
      const anPrototype = {
        prototype: {
          doSomething: () => {
            return FunctionReturnCodes.OK;
          },
        },
      };
      IntentWrapper(
        (anPrototype.prototype as unknown) as Creep,
        "doSomething",
        anPrototype.prototype.doSomething
      );
      expect(
        anPrototype.prototype.doSomething() === FunctionReturnCodes.OK
      ).toBeTruthy();
      anPrototype.prototype.doSomething();
    });
  });
});
