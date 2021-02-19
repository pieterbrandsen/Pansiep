import { LogLevel } from "./config/global";
import { LogTypes } from "./constants/global";

interface LogType {
  name: string;
  color: string;
}

export default class Logger {
  private static Log(
    logType: LogType,
    fileLocation: string,
    message: string,
    args?: unknown
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
    args?: unknown
  ): string {
    let htmlString = `<span style='color:${logInfo.color}'>`;
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
    args?: unknown
  ): boolean {
    if (LogLevel < LogTypes.Info) return false;
    return this.Log(
      { name: "Info", color: "FloralWhite" },
      fileLocation,
      message,
      args
    );
  }

  public static Warn(
    fileLocation: string,
    message: string,
    args?: unknown
  ): boolean {
    if (LogLevel < LogTypes.Warn) return false;
    return this.Log(
      { name: "Warn", color: "GoldenRod" },
      fileLocation,
      message,
      args
    );
  }

  public static Error(
    fileLocation: string,
    message: string,
    args?: unknown
  ): boolean {
    if (LogLevel < LogTypes.Error) return false;
    try {
      // If an error was in the logging function it should throw otherwise it would come back again here because it will error again otherwise.
      if (fileLocation === "Utils/logger:Log")
        throw new Error("Prevented stack overflow");
      return this.Log(
        { name: "Error", color: "Crimson" },
        fileLocation,
        message,
        args
      );
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
    args?: unknown
  ): boolean {
    if (LogLevel < LogTypes.Debug) return false;
    return this.Log(
      { name: "Debug", color: "DodgerBlue" },
      fileLocation,
      message,
      args
    );
  }
}
