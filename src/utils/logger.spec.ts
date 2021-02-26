import { mockGlobal } from "screeps-jest";
import { Log, MessageGenerator, ShouldLog } from "./logger";
import { FunctionReturnCodes, LogTypes } from "./constants/global";

jest.mock("./config/global", () => {
  return {
    LogLevel: { code: 250, value: { name: "UnitTest", color: "DodgerBlue" } },
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

describe("Logger", () => {
  const fileLoc = "FileLocation";
  const msg = "message";
  describe("MessageGenerator methods", () => {
    it("should return OK and a string", () => {
      let messageGenerator = MessageGenerator(fileLoc, msg, LogTypes.Debug);
      expect(messageGenerator.code === FunctionReturnCodes.OK).toBeTruthy();

      messageGenerator = MessageGenerator(fileLoc, msg, LogTypes.Debug, "a");
      expect(messageGenerator.code === FunctionReturnCodes.OK).toBeTruthy();

      messageGenerator = MessageGenerator(fileLoc, msg, LogTypes.Debug, [
        "a",
        "b",
      ]);
      expect(messageGenerator.code === FunctionReturnCodes.OK).toBeTruthy();

      messageGenerator = MessageGenerator(fileLoc, msg, LogTypes.Debug, {
        0: "a",
        1: "b",
      });
      expect(messageGenerator.code === FunctionReturnCodes.OK).toBeTruthy();

      const longObj: StringMap<number> = {};
      for (let i = 0; i < 1000; i += 1) {
        longObj[i] = i * 1000;
      }
      messageGenerator = MessageGenerator(
        fileLoc,
        msg,
        LogTypes.Debug,
        longObj
      );
      expect(messageGenerator.code === FunctionReturnCodes.OK).toBeTruthy();
    });
  });
  describe("ShouldLog method", () => {
    it("should return OK", () => {
      let shouldLog = ShouldLog(LogTypes.None.code);
      expect(shouldLog.code === FunctionReturnCodes.OK).toBeTruthy();

      shouldLog = ShouldLog(LogTypes.Error.code);
      expect(shouldLog.code === FunctionReturnCodes.OK).toBeTruthy();

      shouldLog = ShouldLog(LogTypes.Warn.code);
      expect(shouldLog.code === FunctionReturnCodes.OK).toBeTruthy();
    });
    it("should return TARGET_IS_ON_DELAY_OR_OFF", () => {
      let shouldLog = ShouldLog(LogTypes.Info.code);
      expect(
        shouldLog.code === FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      ).toBeTruthy();

      shouldLog = ShouldLog(LogTypes.Debug.code);
      expect(
        shouldLog.code === FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      ).toBeTruthy();

      shouldLog = ShouldLog(LogTypes.All.code);
      expect(
        shouldLog.code === FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      ).toBeTruthy();
    });
  });
  describe("Log method", () => {
    it("should return OK", () => {
      const baseConsoleLog = console.log;
      console.log = jest.fn();
      const log = Log(LogTypes.Error, fileLoc, msg);
      console.log = baseConsoleLog;
      expect(log.code === FunctionReturnCodes.OK).toBeTruthy();
    });
    it("should return TARGET_IS_ON_DELAY_OR_OFF", () => {
      const log = Log(LogTypes.All, fileLoc, msg);
      expect(
        log.code === FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF
      ).toBeTruthy();
    });
  });
});
