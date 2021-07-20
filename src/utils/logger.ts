import { isObject } from "lodash";
import GlobalConfig from "./config/global";

export default class LoggerHandler {
  /**
   * Create a message to be logged into the console with correct color based on logLevel.
   */
  private static MessageGenerator = function MessageGenerator(
    fileLocation: string,
    message: string,
    logLevel: LogType,
    args?: unknown
  ): string {
    let htmlString = `<span style='color:${logLevel.value.color}'>`;
    htmlString += `<b>${logLevel.value.name}</b>`;
    htmlString += `<br><b>Message: </b>${message}`;
    if (args) {
      if (isObject(args)) {
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
  };

  /**
   * Check if the inputted reqLogLevel is high enough to log the request.
   */
  private static ShouldLog = function ShouldLog(reqLogLevel: number): boolean {
    if (reqLogLevel <= GlobalConfig.LogLevel.code) {
      return true;
    }
    return false;
  };

  /**
   * Create a message to be logged into the console with correct color based on logLevel.
   */
  public static Log = function Log(
    logType: LogType,
    fileLocation: string,
    message: string,
    args?: unknown
  ): void {
    if (!LoggerHandler.ShouldLog(logType.code)) return;

    const messageGenerator = LoggerHandler.MessageGenerator(
      fileLocation,
      message,
      logType,
      args
    );

    console.log(messageGenerator);
  };
}
