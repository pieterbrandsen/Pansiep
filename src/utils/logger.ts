import { isObject } from "lodash";
import { LogLevel } from "./config/global";
import { FunctionReturnCodes } from "./constants/global";
import { FunctionReturnHelper } from "./statusGenerator";

export const MessageGenerator = function MessageGenerator(
  fileLocation: string,
  message: string,
  logInfo: LogType,
  args?: unknown
): FunctionReturn {
  let htmlString = `<span style='color:${logInfo.value.color}'>`;
  htmlString += `<b>${logInfo.value.name}</b>`;
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

export const ShouldLog = function ShouldLog(
  currLogLvl: number,
  reqLogLevel: number
): FunctionReturn {
  return FunctionReturnHelper(
    FunctionReturnCodes.OK,
    currLogLvl >= reqLogLevel
  );
};

export const Log = function Log(
  logType: LogType,
  fileLocation: string,
  message: string,
  args?: unknown
): FunctionReturn {
  if (!ShouldLog(LogLevel.code, logType.code).response)
    return FunctionReturnHelper(FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF);

  const messageGenerator = MessageGenerator(
    fileLocation,
    message,
    logType,
    args
  );
  if (messageGenerator.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  console.log(messageGenerator.response);

  return FunctionReturnHelper(FunctionReturnCodes.OK);
};
