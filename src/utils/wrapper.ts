import _ from "lodash";
import { Log } from "./logger";
import { LogTypes } from "./constants/global";

/**
 * @param funcName
 * @param func
 */
export function FuncWrapper<F extends (...a: any[]) => any>(func: F): F {
  return ((...args: Parameters<F>) => {
    const preProcessingCpu = Game.cpu.getUsed();
    let statsPath = { callCount: 0, cpuUsed: 0 };
    if (global.preProcessingStats) {
      statsPath = global.preProcessingStats.calls[func.name];
      if (_.isUndefined(statsPath)) {
        global.preProcessingStats.calls[func.name] = {
          callCount: 0,
          cpuUsed: 0,
        };
        statsPath = global.preProcessingStats.calls[func.name];
      }
    }

    try {
      return func(...args);
    } catch (error) {
      Log(LogTypes.Error, func.name, error, {
        ...args,
      });
      return { code: 500, response: {} };
    } finally {
      statsPath.callCount += 1;
      statsPath.cpuUsed += Game.cpu.getUsed() - preProcessingCpu;
    }
  }) as F;
}

/**
 * @param functions
 */
export const WrapFunctions = FuncWrapper(function WrapFunctions<
  T extends { [funcName: string]: (...a: any[]) => any }
>(functions: T): T {
  return Object.entries(functions)
    .map(([funcName, func]) => ({ [funcName]: FuncWrapper(func) }))
    .reduce((acc, entry) => Object.assign(acc, entry), {}) as T;
});
