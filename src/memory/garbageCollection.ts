import { forEach, forOwn, remove } from "lodash";
import JobHandler from "../room/jobs/handler";
import GlobalConstants from "../utils/constants/global";
import LoggerHandler from "../utils/logger";
import WrapperHandler from "../utils/wrapper";

export default class GarbageCollectionHandler {
  public static RemoveCreep = WrapperHandler.FuncWrapper(function RemoveCreep(
    roomName: string,
    creepName: string
  ): void {
    const jobs = JobHandler.GetAllJobs(roomName);
    const creepJobs = jobs.filter((j) =>
      j.assignedCreepsNames.includes(creepName)
    );
    forEach(creepJobs, (job: Job) => {
      job.assignedCreepsNames = remove(job.assignedCreepsNames, creepName);
    });

    remove(jobs, (j) => j.objId === creepName);
    JobHandler.OverwriteJobList(roomName, jobs);

    delete Memory.creeps[creepName];

    LoggerHandler.Log(
      GlobalConstants.LogTypes.Debug,
      "memory/garbageCollection:RemoveCreep",
      "Deleted Creep memory",
      creepName
    );
  });

  public static RemoveStructure = WrapperHandler.FuncWrapper(
    function RemoveStructure(roomName: string, id: Id<Structure>): void {
      const jobs = JobHandler.GetAllJobs(roomName);
      const structureJobs = jobs.filter((j) =>
        j.assignedStructuresIds.includes(id)
      );
      forEach(structureJobs, (job: Job) => {
        job.assignedStructuresIds = remove(job.assignedStructuresIds, id);
      });

      remove(jobs, (j) => j.objId === id);

      delete Memory.structures[id];

      LoggerHandler.Log(
        GlobalConstants.LogTypes.Debug,
        "memory/garbageCollection:RemoveStructure",
        "Deleted Structure memory",
        id
      );
    }
  );

  public static RemoveRoom = WrapperHandler.FuncWrapper(function RemoveRoom(
    roomName: string
  ): void {
    forOwn(Memory.structures, (str: StructureMemory, structureId: string) => {
      if (str.room === roomName) {
        GarbageCollectionHandler.RemoveStructure(
          roomName,
          structureId as Id<Structure>
        );
      }
    });
    forOwn(Memory.creeps, (crp: CreepMemory, creepName: string) => {
      if (crp.commandRoom === roomName) {
        GarbageCollectionHandler.RemoveCreep(roomName, creepName);
      }
    });

    delete Memory.rooms[roomName];
    delete Memory.stats.rooms[roomName];

    LoggerHandler.Log(
      GlobalConstants.LogTypes.Debug,
      "memory/garbageCollection:RemoveRoom",
      "Deleted Room memory",
      roomName
    );
  });
}
