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

export const GetAllCreepNames = FuncWrapper(function GetAllCreepNames(
  id: string
): FunctionReturn {
  const creepNames: string[] | undefined = Memory.cache.creeps.data[id]
    ? Memory.cache.creeps.data[id].map((c) => c.id)
    : undefined;
  if (isUndefined(creepNames))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper(FunctionReturnCodes.OK, creepNames);
});
