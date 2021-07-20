import GlobalConstants from "../constants/global";

export default class GlobalConfig {
  /**
   * The level of logging it's going to return to the console.
   */
  public static LogLevel: LogType = GlobalConstants.LogTypes.All;

  private static updateStats = true;
  /**
   * According to the {updateStats} parameter set in global config the stats are updated or skipped.
   */

  public static ShouldUpdateStats = function ShouldUpdateStats(): boolean {
    return GlobalConfig.updateStats;
  };

  /**
   * Change the {updateStats} parameter to a new value.
   */
  public static SetUpdateStatsVar = function SetUpdateStatsVar(
    updatedBool: boolean
  ): void {
    GlobalConfig.updateStats = updatedBool;
  };
}
