import GlobalConfig from "./config/global";
import GlobalConstants from "./constants/global";
import LoggerHandler from "./logger";

describe("Logger", () => {
  beforeEach(() => {
    console.log = jest.fn();
  });
  it("should log an message without args", () => {
    GlobalConfig.LogLevel = GlobalConstants.LogTypes.Debug;
    LoggerHandler.Log(GlobalConstants.LogTypes.Debug, "b", "c");

    expect(console.log).toHaveBeenCalled();
  });
  it("should log an message with args", () => {
    GlobalConfig.LogLevel = GlobalConstants.LogTypes.Debug;
    LoggerHandler.Log(GlobalConstants.LogTypes.Debug, "b", "c", { a: 0 });
    LoggerHandler.Log(GlobalConstants.LogTypes.Debug, "b", "c", "a");

    expect(console.log).toHaveBeenCalled();
  });
  it("should not log because current logLevel is too low", () => {
    GlobalConfig.LogLevel = GlobalConstants.LogTypes.Info;
    LoggerHandler.Log(GlobalConstants.LogTypes.Debug, "b", "c", null);

    expect(console.log).not.toHaveBeenCalled();
  });

  it("should remove all chars longer after 2500th char", () => {
    GlobalConfig.LogLevel = GlobalConstants.LogTypes.Debug;
    const obj = {};
    for (let i = 0; i < 500; i += 1) {
      obj[i] = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    }
    LoggerHandler.Log(GlobalConstants.LogTypes.Debug, "b", "c", obj);

    expect(console.log).toHaveBeenCalled();
  });
});
