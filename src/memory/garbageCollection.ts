import { forEach, forOwn, remove } from "lodash";
import FuncWrapper from "../utils/wrapper";
import JobHandler from "../room/jobs/handler";
import GlobalConstants from "../utils/constants/global";
import LoggerHandler from "../utils/logger";

export default class GarbageCollectionHandler {
  public static RemoveCreep = FuncWrapper(function RemoveCreep(
    name: string,
    roomName: string
  ): boolean {
    const jobs = JobHandler.GetAllJobs(roomName);
    const creepJobs = jobs.filter((j) => j.assignedCreepsNames.includes(name));
    forEach(creepJobs, (job: Job) => {
      job.assignedCreepsNames = remove(job.assignedCreepsNames, name);
    });

    remove(jobs, (j) => j.objId === name);
    JobHandler.OverwriteJobList(roomName, jobs);

    delete Memory.creeps[name];

    LoggerHandler.Log(
      GlobalConstants.LogTypes.Debug,
      "memory/garbageCollection:RemoveCreep",
      "Deleted Creep memory",
      name
    );

    return true;
  });

  public static RemoveStructure = FuncWrapper(function RemoveStructure(
    id: Id<Structure>,
    roomName: string
  ): boolean {
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

    return true;
  });

  public static RemoveRoom = FuncWrapper(function RemoveRoom(
    roomName: string
  ): boolean {
    forOwn(Memory.structures, (str: StructureMemory, key: string) => {
      if (str.room === roomName) {
        GarbageCollectionHandler.RemoveStructure(
          key as Id<Structure>,
          roomName
        );
      }
    });
    forOwn(Memory.creeps, (crp: CreepMemory, key: string) => {
      if (crp.commandRoom === roomName) {
        GarbageCollectionHandler.RemoveCreep(key as Id<Creep>, roomName);
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

    return true;
  });
}
