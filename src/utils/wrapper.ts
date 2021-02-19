import Logger from "./logger";

/**
 * @param funcName
 * @param func
 */
export function FuncWrapper<F extends (...a: any[]) => any>(func: F): F {
  return ((...args: Parameters<F>) => {
    const preProcessingCpu = Game.cpu.getUsed();
    let statsPath = global.preProcessingStats.calls[func.name];
    if (statsPath === undefined) {
      global.preProcessingStats.calls[func.name] = {
        callCount: 0,
        cpuUsed: 0,
      };
      statsPath = global.preProcessingStats.calls[func.name];
    }

    try {
      return func(...args);
    } catch (error) {
      Logger.Error("src/utils/wrapper:GlobalFuncWrapper", error, {
        ...args,
      });
      return false;
    } finally {
      statsPath.callCount += 1;
      statsPath.cpuUsed += Game.cpu.getUsed() - preProcessingCpu;
    }
  }) as F;
}

/**
 * @param functions
 */
export function WrapFunctions<
  T extends { [funcName: string]: (...a: any[]) => any }
>(functions: T): T {
  return Object.entries(functions)
    .map(([funcName, func]) => ({ [funcName]: FuncWrapper(func) }))
    .reduce((acc, entry) => Object.assign(acc, entry), {}) as T;
}
