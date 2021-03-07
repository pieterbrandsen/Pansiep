import { LogTypes } from "../constants/global";

export const LogLevel: LogType = LogTypes.All;
let UpdateStats = true;
export const GetUpdateStatsVar = function GetUpdateStatsVar(): boolean {
  return UpdateStats;
};
export const SetUpdateStatsVar = function SetUpdateStatsVar(
  newBool: boolean
): void {
  UpdateStats = newBool;
};
