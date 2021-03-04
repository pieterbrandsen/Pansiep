import { forOwn, remove } from "lodash";
import { Log } from "../utils/logger";
import { ResetRoomStats } from "./stats";
import { FuncWrapper } from "../utils/wrapper";
import { FunctionReturnCodes, LogTypes } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { GetJobs, UpdateJobById } from "../room/jobs";

export const RemoveCreep = FuncWrapper(function RemoveCreep(
  id: string,
  roomName: string
): FunctionReturn {
  const jobs: Job[] = GetJobs(roomName).response;
  const job = jobs.find((j) => j.assignedCreepsIds.includes(id));
  if (job) {
    job.assignedCreepsIds = remove(job.assignedCreepsIds, id);
    UpdateJobById(job.id, job, roomName);
  }

  delete Memory.creeps[id];
  // TODO This deleted cached, this is not intended
  remove(Memory.cache.creeps.data[roomName], (c) => c.id);

  Log(
    LogTypes.Debug,
    "memory/garbageCollection:RemoveCreep",
    "Deleted Creep memory",
    id
  );

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const RemoveStructure = FuncWrapper(function RemoveStructure(
  id: string,
  roomName: string
): FunctionReturn {
  const jobs: Job[] = GetJobs(roomName).response;
  const job = jobs.find((j) => j.assignedStructuresIds.includes(id));
  if (job) {
    job.assignedStructuresIds = remove(job.assignedStructuresIds, id);
    UpdateJobById(job.id, job, roomName);
  }

  delete Memory.structures[id];
  Memory.cache.structures.data[roomName] = remove(
    Memory.cache.structures.data[roomName],
    (s) => s.id
  );

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
      RemoveStructure(key, roomName);
    }
  });
  forOwn(Memory.creeps, (crp: CreepMemory, key: string) => {
    if (crp.commandRoom === roomName) {
      RemoveCreep(key, roomName);
    }
  });

  delete Memory.rooms[roomName];
  Memory.cache.rooms.data = remove(
    Memory.cache.rooms.data,
    (s) => s === roomName
  );

  ResetRoomStats(roomName);

  Log(
    LogTypes.Debug,
    "memory/garbageCollection:RemoveRoom",
    "Deleted Room memory",
    roomName
  );

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
