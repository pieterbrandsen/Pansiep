import { isObject } from "lodash";
import { LogLevel } from "./config/global";
import { FunctionReturnCodes } from "./constants/global";
import { FunctionReturnHelper } from "./functionStatusGenerator";

/**
 * Create a message to be logged into the console with correct color based on logLevel.
 *
 * @param {string} fileLocation - Location of file
 * @param {string} message - Message to be logged
 * @param {LogType} logLevel - Log level opf logging
 * @param {unknown} [args] - Args inputted
 * @return {FunctionReturn} HTTP response with code and data
 *
 * @example
 *
 *     MessageGenerator("utils.logger","Nothing to worry about", logLevel)
 */
export const MessageGenerator = function MessageGenerator(
  fileLocation: string,
  message: string,
  logLevel: LogType,
  args?: unknown
): FunctionReturn {
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
  return FunctionReturnHelper(FunctionReturnCodes.OK, htmlString);
};

/**
 * Check if the inputted reqLogLevel is high enough to log the request.
 *
 * @param {string} reqLogLevel - Log level required to be lower then current LogLevel
 * @return {FunctionReturn} HTTP response with code and data
 *
 * @example
 *
 *     ShouldLog()
 */
export const ShouldLog = function ShouldLog(
  reqLogLevel: number
): FunctionReturn {
  if (reqLogLevel <= LogLevel.code) {
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
  return FunctionReturnHelper(FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF);
};

/**
 * Create a message to be logged into the console with correct color based on logLevel.
 *
 * @param {LogType} logType - Log level opf logging
 * @param {string} fileLocation - Location of file
 * @param {string} message - Message to be logged
 * @param {unknown} [args] - Args inputted
 * @return {FunctionReturn} HTTP response with code and data
 *
 * @example
 *
 *     Log(LogLevel,"utils.logger","Nothing to worry about")
 */
export const Log = function Log(
  logType: LogType,
  fileLocation: string,
  message: string,
  args?: unknown
): FunctionReturn {
  const shouldLog = ShouldLog(logType.code);
  if (shouldLog.code === FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF)
    return FunctionReturnHelper(shouldLog.code);

  const messageGenerator = MessageGenerator(
    fileLocation,
    message,
    logType,
    args
  );
  if (messageGenerator.code !== FunctionReturnCodes.OK) {
    return FunctionReturnHelper(FunctionReturnCodes.INTERNAL_SERVER_ERROR);
  }

  console.log(messageGenerator.response);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
};
