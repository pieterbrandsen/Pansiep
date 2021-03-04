import { isUndefined, forOwn } from "lodash";
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

export const GetCreepsMemory = FuncWrapper(function GetAllCreepMemory(
  id: string,
  filterOnType?: CreepTypes[]
): FunctionReturn {
  const creepsMemory: CreepMemory[] = [];

  forOwn(Memory.creeps, (mem: CreepMemory) => {
    if (
      isUndefined(mem.isNotSeenSince) &&
      mem.commandRoom === id &&
      (filterOnType ? filterOnType.includes(mem.type) : true)
    )
      creepsMemory.push(mem);
  });

  return FunctionReturnHelper(FunctionReturnCodes.OK, creepsMemory);
});

export const GetCachedCreepIds = FuncWrapper(function GetAllCreepIds(
  id: string
): FunctionReturn {
  const creepsCache: CreepCache[] | undefined = Memory.cache.creeps.data[id];
  if (isUndefined(creepsCache))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  const creepIds = creepsCache.map((c) => c.id);
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
