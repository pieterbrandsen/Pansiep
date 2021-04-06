import { FunctionReturnCodes } from "./constants/global";
import { FunctionReturnHelper } from "./statusGenerator";
import { FuncWrapper } from "./wrapper";

export const ExecuteEachTick = FuncWrapper(function ExecuteEachTick(
  tickAmount: number,
  forceTrue = false
): FunctionReturn {
  const executeThisTick: boolean = Game.time % tickAmount === 0;
  return FunctionReturnHelper(
    FunctionReturnCodes.OK,
    forceTrue || executeThisTick
  );
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
