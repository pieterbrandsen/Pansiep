import _ from "lodash";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { FuncWrapper } from "../utils/wrapper";
import { FunctionReturnCodes } from "../utils/constants/global";

export const GetCreep = FuncWrapper(function GetCreep(
  id: string
): FunctionReturn {
  const creep: Creep | null = Game.creeps[id];
  if (_.isNull(creep))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper<Creep>(FunctionReturnCodes.OK, creep);
});

export const GetAllCreepNames = FuncWrapper(function GetAllCreepNames(
  id: string
): FunctionReturn {
  const creepNames: string[] | undefined = Memory.cache.creeps.data[id]
    ? Memory.cache.creeps.data[id].map((c) => c.id)
    : undefined;
  if (!_.isUndefined(creepNames))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper(FunctionReturnCodes.OK, creepNames);
});
