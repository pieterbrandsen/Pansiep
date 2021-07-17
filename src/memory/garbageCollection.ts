import { forOwn, remove } from "lodash";
import { Log } from "../utils/logger";
import { ResetRoomStats } from "./stats";
import { FuncWrapper } from "../utils/wrapper";
import { FunctionReturnCodes, LogTypes } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/functionStatusGenerator";
import { GetAllJobs, UpdateJobById, UpdateJobList } from "../room/jobs/handler";

export const RemoveCreep = FuncWrapper(function RemoveCreep(
  name: string,
  roomName: string
): FunctionReturn {
  const getAllJobs = GetAllJobs(roomName);
  if (getAllJobs.code !== FunctionReturnCodes.OK) {
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
  const jobs: Job[] = getAllJobs.response;
  const job = jobs.find((j) => j.assignedCreepsNames.includes(name));
  if (job) {
    job.assignedCreepsNames = remove(job.assignedCreepsNames, name);
    UpdateJobById(job.id, job, roomName);
  }
  remove(jobs, (j) => j.objId === name);
  UpdateJobList(roomName, jobs);

  delete Memory.creeps[name];

  Log(
    LogTypes.Debug,
    "memory/garbageCollection:RemoveCreep",
    "Deleted Creep memory",
    name
  );

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const RemoveStructure = FuncWrapper(function RemoveStructure(
  id: Id<Structure>,
  roomName: string
): FunctionReturn {
  const getAllJobs = GetAllJobs(roomName);
  if (getAllJobs.code !== FunctionReturnCodes.OK) {
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
  const jobs: Job[] = getAllJobs.response;
  const job = jobs.find((j) => j.assignedStructuresIds.includes(id));
  if (job) {
    job.assignedStructuresIds = remove(job.assignedStructuresIds, id);
    UpdateJobById(job.id, job, roomName);
  }
  remove(jobs, (j) => j.objId === id);
  UpdateJobList(roomName, jobs);

  delete Memory.structures[id];

  Log(
    LogTypes.Debug,
    "memory/garbageCollection:RemoveStructure",
    "Deleted Structure memory",
    id
  );

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const RemoveRoom = FuncWrapper(function RemoveRoom(
  roomName: string
): FunctionReturn {
  forOwn(Memory.structures, (str: StructureMemory, key: string) => {
    if (str.room === roomName) {
      RemoveStructure(key as Id<Structure>, roomName);
    }
  });
  forOwn(Memory.creeps, (crp: CreepMemory, key: string) => {
    if (crp.commandRoom === roomName) {
      RemoveCreep(key as Id<Creep>, roomName);
    }
  });

  delete Memory.rooms[roomName];
  ResetRoomStats(roomName);

  Log(
    LogTypes.Debug,
    "memory/garbageCollection:RemoveRoom",
    "Deleted Room memory",
    roomName
  );

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
