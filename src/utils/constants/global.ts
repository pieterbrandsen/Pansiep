export class LogTypes {
  // Chosen log level includes all the log levels above it
  public static None = 0;

  public static Info = 1;

  public static Warn = 250;

  public static Error = 500;

  public static Debug = 750;

  public static All = 999;
}

export const Username = "PandaMaster";

export const CacheNextCheckIncrement = {
  rooms: 50,
  structures: 50,
  creeps: 50,
};
