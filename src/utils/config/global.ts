import { LogTypes } from "../constants/global";

interface IGlobalConfig {}

export default class GlobalConfig implements IGlobalConfig {
  public static LogLevel: LogTypes = LogTypes.All;
}
