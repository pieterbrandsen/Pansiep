import { FunctionReturnCodes } from "./constants/global";
import { FunctionReturnHelper } from "./statusGenerator";
import { FuncWrapper } from "./wrapper";

// eslint-disable-next-line
export const ExecuteEachTick = FuncWrapper(function ExecuteEachTick(
  tickAmount: number
): FunctionReturn {
  const executeThisTick = Game.time % tickAmount === 0;
  return FunctionReturnHelper(FunctionReturnCodes.OK, executeThisTick);
});
