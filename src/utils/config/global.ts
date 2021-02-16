import { LogLevels } from "../constants/global";

interface IGlobalConfig {}

export default class GlobalConfig implements IGlobalConfig {
  public static LogLevel: LogLevels = LogLevels.All;
}
