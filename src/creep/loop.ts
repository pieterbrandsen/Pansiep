import _ from "lodash";
import { GetAllCreepNames, GetCreep } from "./helper";
import { IsCreepMemoryInitialized } from "../memory/initialization";
import { CreepStatsPreProcessing } from "../memory/stats";
import { FuncWrapper } from "../utils/wrapper";
import { FunctionReturnCodes } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/statusGenerator";

export const RunCreep = FuncWrapper(function RunCreep(
  id: string
): FunctionReturn {
  const getCreep = GetCreep(id);
  const creep = getCreep.response as Creep;
  if (getCreep.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);

  CreepStatsPreProcessing(creep);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const Run = FuncWrapper(function RunCreeps(
  roomName: string
): FunctionReturn {
  const getCreepNames = GetAllCreepNames(roomName);
  if (getCreepNames.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  _.forEach(getCreepNames.response, (key: string) => {
    const isCreepMemoryInitialized = IsCreepMemoryInitialized(key);
    if (isCreepMemoryInitialized.code === FunctionReturnCodes.OK) RunCreep(key);
  });

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
