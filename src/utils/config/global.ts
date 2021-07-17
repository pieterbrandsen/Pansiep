import { LogTypes } from "../constants/global";

/**
 * The level of logging it's going to return to the console.
 */
export const LogLevel: LogType = LogTypes.All;

let updateStats = true;
/**
 * According to the {updateStats} parameter set in global config the stats are updated or skipped.
 *
 * @return {boolean} Is it allowed to update stats
 *
 * @example
 *     ShouldUpdateStats()
 */

export const ShouldUpdateStats = function ShouldUpdateStats(): boolean {
  return updateStats;
};

/**
 * Change the {updateStats} parameter to a new value.
 *
 * @param {boolean} updatedBool - New bool for updating stats or skipping. stats
 *
 * @example
 *     SetUpdateStatsVar(true)
 */
export const SetUpdateStatsVar = function SetUpdateStatsVar(
  updatedBool: boolean
): void {
  updateStats = updatedBool;
};
