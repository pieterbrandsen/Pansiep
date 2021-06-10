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

/**
 * Return live position because its otherwise not an active RoomPosition object.
 *
 * @param {RoomPosition} objPos - Object position
 * @return {FunctionReturn} HTTP response with code and data
 */
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

// export const LoadMemory = function LoadMemory() {
//   const preCpu = Game.cpu.getUsed();
//   Memory;
//   console.log(`Pre-cpu: ${preCpu}, end-cpu: ${Game.cpu.getUsed()}`);
//   return FunctionReturnHelper(FunctionReturnCodes.OK)
// }

/**
 * Return object based on inputted Id if its found in the database of Screeps
 *
 * @param {Id<Structure | Creep | ConstructionSite | Source>} id - Id of object
 * @return {FunctionReturn} HTTP response with code and data
 *
 * @example
 *
 *     GetObject(123432)
 */
export const GetObject = FuncWrapper(function GetObject(
  id: Id<Structure | Creep | ConstructionSite | Source>
): FunctionReturn {
  const obj:
    | Structure
    | Creep
    | ConstructionSite
    | Source
    | null = Game.getObjectById(id);
  if (obj === null) return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper(FunctionReturnCodes.OK, obj);
});
