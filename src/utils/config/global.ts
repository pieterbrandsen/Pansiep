import GlobalConstants from "../constants/global";

export default class GlobalConfig {
  /**
   * The level of logging it's going to return to the console.
   */
  public static LogLevel: LogType = GlobalConstants.LogTypes.All;

  public static UpdateStats = true;
}
