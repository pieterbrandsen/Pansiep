export const LogTypes: StringMap<LogType> = {
  // Chosen log level includes all the log levels above it
  None: { code: 0, value: { name: "None", color: "None" } },
  Info: { code: 1, value: { name: "Info", color: "FloralWhite" } },
  Warn: { code: 250, value: { name: "Warn", color: "GoldenRod" } },
  Error: { code: 500, value: { name: "Error", color: "Crimson" } },
  Debug: { code: 750, value: { name: "Debug", color: "DodgerBlue" } },
  All: { code: 999, value: { name: "All", color: "None" } },
};

export const FunctionReturnCodes = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  TARGET_IS_ON_DELAY_OR_OFF: 203,
  NO_CONTENT: 204,
  NOT_MODIFIED: 304,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  LOOP_DETECTED: 508,
};

export const Username = "PandaMaster";

export const CacheNextCheckIncrement = {
  rooms: 50,
  structures: 50,
  creeps: 50,
};

export const SaveUnloadedObjectForAmountTicks = 500;

export const AverageValueOverAmountTicks = 10000;

export const StatsDigitCount =
  5 + AverageValueOverAmountTicks.toString().length;
