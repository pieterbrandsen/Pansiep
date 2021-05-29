import { forEach, isUndefined } from "lodash";
import {
  GetCachedCreepIds,
  GetCreep,
  ExecuteJob,
  TryToCreateHealJob,
} from "./helper";
import { IsCreepMemoryInitialized } from "../memory/initialization";
import { CreepStatsPreProcessing } from "../memory/stats";
import { FuncWrapper } from "../utils/wrapper";
import { FunctionReturnCodes } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/functionStatusGenerator";
import { AssignNewJobForCreep } from "../room/jobs/handler";

export const RunCreep = FuncWrapper(function RunCreep(
  name: string
): FunctionReturn {
  const getCreep = GetCreep(name);
  if (getCreep.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  const creep = getCreep.response as Creep;
  const creepMem = Memory.creeps[name];
  if (isUndefined(creepMem.jobId)) {
  AssignNewJobForCreep(creep);
  } else {
  ExecuteJob(creep, creepMem);
  }

  TryToCreateHealJob(creep);
  CreepStatsPreProcessing(creep);

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const Run = FuncWrapper(function RunCreeps(
  roomName: string
): FunctionReturn {
  const getCreepIds = GetCachedCreepIds(roomName);
  if (getCreepIds.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  forEach(getCreepIds.response, (name: string) => {
    const isCreepMemoryInitialized = IsCreepMemoryInitialized(name);
    if (isCreepMemoryInitialized.code === FunctionReturnCodes.OK)
      RunCreep(name);
  });

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
