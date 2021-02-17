import { mockGlobal } from "screeps-jest";
import Logger from "./logger";
import GlobalConfig from "./config/global";
import { LogTypes } from "./constants/global";

const fileLocation = "utils/logger:unit";
const message = "A message";
const value = 345;
const smallObject: Record<string, unknown> = { anProperty: {} };

describe("Logging message with text", () => {
  it("should return true after the message has been logged", () => {
    mockGlobal<Game>("console", { log: jest.fn(() => undefined) });
    expect(Logger.Info(fileLocation, message, value)).toBeTruthy();
    expect(Logger.Warn(fileLocation, message)).toBeTruthy();
    expect(Logger.Error(fileLocation, message, smallObject)).toBeTruthy();
    expect(Logger.Debug(fileLocation, message)).toBeTruthy();

    GlobalConfig.LogLevel = LogTypes.Info;
    expect(Logger.Info(fileLocation, message)).toBeTruthy();
    GlobalConfig.LogLevel = LogTypes.Warn;
    expect(Logger.Warn(fileLocation, message)).toBeTruthy();
    GlobalConfig.LogLevel = LogTypes.Error;
    expect(Logger.Error(fileLocation, message)).toBeTruthy();
    GlobalConfig.LogLevel = LogTypes.Debug;
    expect(Logger.Debug(fileLocation, message)).toBeTruthy();
  });

  it("should return false after the function returned an error", () => {
    mockGlobal<Game>("Game", { notify: jest.fn(() => undefined) });

    expect(Logger.Error("Utils/logger:Log", message)).toBeFalsy();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).console = null;
    const originalErrorMethod = Logger.Error;
    Logger.Error = () => false;
    expect(Logger.Info(fileLocation, message, value)).toBeFalsy();
    Logger.Error = originalErrorMethod;
  });

  it("should make the object inputted shorter than the original object", () => {
    mockGlobal<Game>("console", { log: jest.fn(() => undefined) });
    mockGlobal<Game>("Game", { notify: jest.fn(() => undefined) });

    const longObject: Record<string, unknown> = {};
    for (let i = 0; i < 1000; i += 1) {
      longObject[i] = smallObject;
    }
    expect(Logger.Info(fileLocation, message, longObject)).toBeTruthy();
  });

  it("should not log message when logging is off or too low for that type", () => {
    mockGlobal<Game>("console", { log: jest.fn(() => undefined) });
    // console.log(GlobalConfig.LogLevel, LogTypes.Error);
    GlobalConfig.LogLevel = LogTypes.None;
    expect(Logger.Info(fileLocation, message)).toBeFalsy();
    expect(Logger.Warn(fileLocation, message)).toBeFalsy();
    expect(Logger.Error(fileLocation, message)).toBeFalsy();
    expect(Logger.Debug(fileLocation, message)).toBeFalsy();
  });
});
