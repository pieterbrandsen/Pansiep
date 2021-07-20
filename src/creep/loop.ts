import { forEach, isUndefined } from "lodash";
import FuncWrapper from "../utils/wrapper";
import JobHandler from "../room/jobs/handler";
import StatsHandler from "../memory/stats";
import MemoryInitializationHandler from "../memory/initialization";
import CreepHelper from "./helper";

export default class CreepManager {
  private static RunCreep = FuncWrapper(function RunCreep(name: string): void {
    const creep = CreepHelper.GetCreep(name);
    const creepMem = CreepHelper.GetCreepMemory(name);
    if (isUndefined(creepMem.jobId)) {
      JobHandler.AssignNewJobForCreep(creep);
    } else {
      CreepHelper.ExecuteJob(creep, creepMem);
    }

    if (CreepHelper.IsCreepDamaged(creep) && JobHandler.GetJob(JobHandler.CreateJob.GetHealJobId(creep.name), creep.room.name) === null)
      JobHandler.CreateJob.CreateHealJob(creep);
    StatsHandler.CreepStatsPreProcessing(creep);
  });

  public static Run = FuncWrapper(function RunCreeps(roomName: string): void {
    const creepIds = CreepHelper.GetCachedCreepIds(roomName);
    forEach(creepIds, (name: string) => {
      const isCreepMemoryInitialized = MemoryInitializationHandler.IsCreepMemoryInitialized(
        name
      );
      if (isCreepMemoryInitialized) CreepManager.RunCreep(name);
    });
  });
}
