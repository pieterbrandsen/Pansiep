import { isUndefined } from "lodash";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { FuncWrapper } from "../utils/wrapper";
import { FunctionReturnCodes } from "../utils/constants/global";

export const GetCreep = FuncWrapper(function GetCreep(
  id: string
): FunctionReturn {
  const creep: Creep | undefined = Game.creeps[id];
  if (isUndefined(creep))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper<Creep>(FunctionReturnCodes.OK, creep);
});

export const GetAllCreepIds = FuncWrapper(function GetAllCreepIds(
  id: string
): FunctionReturn {
  const creepIds: string[] | undefined = Memory.cache.creeps.data[id]
    ? Memory.cache.creeps.data[id].map((c) => c.id)
    : undefined;
  if (isUndefined(creepIds))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper(FunctionReturnCodes.OK, creepIds);
});

export const GetType = FuncWrapper(function GetType(
  creep: Creep
): FunctionReturn {
  if (creep.getActiveBodyparts(CLAIM) > 0) {
    return FunctionReturnHelper(FunctionReturnCodes.OK, "claim");
  }
  if (creep.getActiveBodyparts(HEAL) > 0) {
    return FunctionReturnHelper(FunctionReturnCodes.OK, "heal");
  }
  if (
    creep.getActiveBodyparts(ATTACK) + creep.getActiveBodyparts(RANGED_ATTACK) >
    0
  ) {
    return FunctionReturnHelper(FunctionReturnCodes.OK, "attack");
  }
  if (creep.getActiveBodyparts(WORK) > 0) {
    return FunctionReturnHelper(FunctionReturnCodes.OK, "work");
  }
  if (creep.getActiveBodyparts(CARRY) > 0) {
    return FunctionReturnHelper(FunctionReturnCodes.OK, "transferring");
  }
  if (creep.getActiveBodyparts(MOVE) > 0) {
    return FunctionReturnHelper(FunctionReturnCodes.OK, "move");
  }

  return FunctionReturnHelper(FunctionReturnCodes.OK, "none");
});
