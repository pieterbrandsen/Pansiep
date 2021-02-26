import { forEach } from "lodash";
import { GetAllCreepIds, GetCreep } from "./helper";
import { IsCreepMemoryInitialized } from "../memory/initialization";
import { CreepStatsPreProcessing } from "../memory/stats";
import { FuncWrapper } from "../utils/wrapper";
import { FunctionReturnCodes } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/statusGenerator";

export const RunCreep = FuncWrapper(function RunCreep(
  id: string
): FunctionReturn {
  const getCreep = GetCreep(id);
  if (getCreep.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  const creep = getCreep.response as Creep;

  CreepStatsPreProcessing(creep);

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const Run = FuncWrapper(function RunCreeps(
  roomName: string
): FunctionReturn {
  const getCreepIds = GetAllCreepIds(roomName);
  if (getCreepIds.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  forEach(getCreepIds.response, (value: string) => {
    const isCreepMemoryInitialized = IsCreepMemoryInitialized(value);
    if (isCreepMemoryInitialized.code === FunctionReturnCodes.OK)
      RunCreep(value);
  });

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
