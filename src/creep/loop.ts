import { forEach, isUndefined } from "lodash";
import JobHandler from "../room/jobs/handler";
import StatsHandler from "../memory/stats";
import MemoryInitializationHandler from "../memory/initialization";
import CreepHelper from "./helper";
import WrapperHandler from "../utils/wrapper";

export default class CreepManager {
  public static RunCreep = WrapperHandler.FuncWrapper(function RunCreep(
    name: string
  ): void {
    const creep = CreepHelper.GetCreep(name);
    if (creep === undefined) return;

    const creepMem = CreepHelper.GetCreepMemory(name);
    if (isUndefined(creepMem.jobId)) {
      JobHandler.AssignNewJobForCreep(creep);
    } else {
      CreepHelper.ExecuteJob(creep, creepMem);
    }

    CreepHelper.ControlCreepHealing(creep);
    StatsHandler.CreepStatsPreProcessing(creep.room.name);
  });

  public static Run = WrapperHandler.FuncWrapper(function RunCreeps(
    roomName: string
  ): void {
    const creepIds = CreepHelper.GetCachedCreepIds(roomName);
    forEach(creepIds, (name: string) => {
      const isCreepMemoryInitialized = MemoryInitializationHandler.IsCreepMemoryInitialized(
        name
      );
      if (isCreepMemoryInitialized) CreepManager.RunCreep(name);
    });
  });
}
