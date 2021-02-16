import GlobalConfig from "./config/global";
import { LogTypes } from "./constants/global";

interface LogType {
  name: string;
  color: string;
}

class LogTypesHelper {
  public static Info: LogType = { name: "Info", color: "FloralWhite" };

  public static Warn: LogType = { name: "Warn", color: "GoldenRod" };

  public static Error: LogType = { name: "Error", color: "Crimson" };

  public static Debug: LogType = { name: "Debug", color: "DodgerBlue" };
}

interface ILogger {}

export default class Logger implements ILogger {
  private static Log(
    logType: LogType,
    fileLocation: string,
    message: string,
    args?: any
  ): boolean {
    try {
      console.log(this.MessageGenerator(fileLocation, message, logType, args));
      return true;
    } catch (error) {
      this.Error("Utils/logger:Log", error, { fileLocation, message, args });
      return false;
    }
  }

  private static MessageGenerator(
    fileLocation: string,
    message: string,
    logInfo: LogType,
    args?: any
  ): string {
    let htmlString: string = `<span style='color:${logInfo.color}'>`;
    htmlString += `<b>${logInfo.name}</b>`;
    htmlString += `<br><b>Message: </b>${message}`;
    if (args) {
      if (typeof args === "object") {
        let objectString = JSON.stringify(args);
        if (objectString.length > 2500) {
          objectString = `${objectString
            .substring(0, 2500)
            .replace(
              /(.{1,80})/g,
              "$1<br/>"
            )}..... Max length of 2500 chars reached!`;
        }
        htmlString += `<br><b>Args: </b>${objectString}`;
      } else htmlString += `<br><b>Value: </b>${args}`;
    }
    htmlString += `<br><b>Log location: </b>${fileLocation}`;
    htmlString += "</span><br>";
    return htmlString;
  }

  public static Info(
    fileLocation: string,
    message: string,
    args?: any
  ): boolean {
    if (GlobalConfig.LogLevel < LogTypes.Info) return false;
    return this.Log(LogTypesHelper.Info, fileLocation, message, args);
  }

  public static Warn(
    fileLocation: string,
    message: string,
    args?: any
  ): boolean {
    if (GlobalConfig.LogLevel < LogTypes.Warn) return false;
    return this.Log(LogTypesHelper.Warn, fileLocation, message, args);
  }

  public static Error(
    fileLocation: string,
    message: string,
    args?: any
  ): boolean {
    if (GlobalConfig.LogLevel < LogTypes.Error) return false;
    try {
      // If an error was in the logging function it should throw otherwise it would come back again here because it will error again otherwise.
      if (fileLocation === "Utils/logger:Log")
        throw new Error("Prevented stack overflow");
      return this.Log(LogTypesHelper.Error, fileLocation, message, args);
    } catch (error) {
      // This should never happen!
      const logMessage = `<span style='color:DarkRed'>There was an error while logging an error!!!<br>Please check the following args and location: ${JSON.stringify(
        { fileLocation, message, args }
      )}<br>Error: ${error}</span`;
      console.log(logMessage);
      Game.notify(logMessage);
      return false;
    }
  }

  public static Debug(
    fileLocation: string,
    message: string,
    args?: any
  ): boolean {
    if (GlobalConfig.LogLevel < LogTypes.Debug) return false;
    return this.Log(LogTypesHelper.Debug, fileLocation, message, args);
  }
}
