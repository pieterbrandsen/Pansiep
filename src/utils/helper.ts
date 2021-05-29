import { FunctionReturnCodes } from "./constants/global";
import { FunctionReturnHelper } from "./functionStatusGenerator";
import { FuncWrapper } from "./wrapper";

/**
 * Checks if this tick the function should be executed.
 *
 * @param {string} tickAmount - Execute each ... ticks
 * @param {string} forceExecute - Force execute function
 * @return {boolean} Is it allowed to execute?
 *
 * @example
 *     ExecuteEachTick(100)
 */
// eslint-disable-next-line import/prefer-default-export
export const ExecuteEachTick = FuncWrapper(function ExecuteEachTick(
  tickAmount: number,
  forceExecute = false
): FunctionReturn {
  if (forceExecute)
    return FunctionReturnHelper(FunctionReturnCodes.OK, forceExecute);

  const executeThisTick: boolean = Game.time % tickAmount === 0;
  return FunctionReturnHelper(FunctionReturnCodes.OK, executeThisTick);
});

export const CreateRoomPosition = FuncWrapper(function CreateRoomPosition(
  objPos: RoomPosition
): FunctionReturn {
  const pos: RoomPosition = new RoomPosition(
    objPos.x,
    objPos.y,
    objPos.roomName
  );
  return FunctionReturnHelper(FunctionReturnCodes.OK, pos);
});

export const LoadMemory = function LoadMemory() {
  const preCpu = Game.cpu.getUsed();
  Memory;
  console.log(`Pre-cpu: ${preCpu}, end-cpu: ${Game.cpu.getUsed()}`);
  return FunctionReturnHelper(FunctionReturnCodes.OK)
}