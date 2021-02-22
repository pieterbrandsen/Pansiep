import _ from "lodash";
import { Log } from "./logger";
import { LogTypes } from "./constants/global";

/**
 * @param func
 * @param inputFuncName
 * @returns {F} Function
 */
// eslint-disable-next-line
export function FuncWrapper<F extends (...a: any[]) => any>(
  func: F,
  inputFuncName?: string
): F {
  return ((...args: Parameters<F>) => {
    const funcName = _.isString(inputFuncName) ? inputFuncName : func.name;
    const preProcessingCpu = Game.cpu.getUsed();
    let statsPath = { callCount: 0, cpuUsed: 0 };

    if (global.preProcessingStats) {
      statsPath = global.preProcessingStats.funcCalls[funcName];
      if (_.isUndefined(statsPath)) {
        global.preProcessingStats.funcCalls[funcName] = {
          callCount: 0,
          cpuUsed: 0,
        };
        statsPath = global.preProcessingStats.funcCalls[funcName];
      }
    }

    try {
      return func(...args);
    } catch (error) {
      Log(LogTypes.Error, funcName, error, {
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
  // eslint-disable-next-line
  T extends { [funcName: string]: (...a: any[]) => any }
>(functions: T): T {
  return Object.entries(functions)
    .map(([funcName, func]) => ({ [funcName]: FuncWrapper(func) }))
    .reduce((acc, entry) => Object.assign(acc, entry), {}) as T;
});

/**
 * @param func
 * @param methodType
 * @param inputFuncName
 * @param this
 * @param protoObj
 * @param funcName
 * @param baseFunc
 */
// eslint-disable-next-line
export function IntentWrapper<F extends (...a: any[]) => any>(
  // eslint-disable-next-line
this: any,
  protoObj: Room | Structure | Creep,
  funcName: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  baseFunc: Function
): void {
  // eslint-disable-next-line
  ((protoObj as unknown) as StringMap<Function>)[funcName] = function func(
    ...args: Parameters<F>
  ) {
    const preProcessingCpu = Game.cpu.getUsed();
    let statsPath = global.preProcessingStats.intentCalls[funcName];
    if (_.isUndefined(statsPath)) {
      global.preProcessingStats.intentCalls[funcName] = {
        callCount: 0,
        cpuUsed: 0,
      };
      statsPath = global.preProcessingStats.intentCalls[funcName];
    }

    const ret = baseFunc.call(this, ...args);

    statsPath.callCount += 1;
    statsPath.cpuUsed += Game.cpu.getUsed() - preProcessingCpu;

    return ret;
  };
}
