import { isUndefined, first, forEach, remove } from "lodash";
import { FuncWrapper } from "../utils/wrapper";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { FunctionReturnCodes } from "../utils/constants/global";
import { GetCreepMemory, UpdateCreepMemory } from "../creep/helper";
import { GetStructureMemory, UpdateStructureMemory } from "../structure/helper";

export const GetJobs = FuncWrapper(function GetJobs(
  roomName: string,
  filterOnTypes?: JobActionTypes[]
): FunctionReturn {
  let jobs = Memory.rooms[roomName].jobs.filter((j) =>
    filterOnTypes ? filterOnTypes.includes(j.action) : true
  );

  if (jobs.length === 0)
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT, []);

  jobs = jobs.sort((a, b) => {
    return Number(a.hasPriority) - Number(b.hasPriority);
  });
  return FunctionReturnHelper(FunctionReturnCodes.OK, jobs);
});

export const GetAvailableJobs = FuncWrapper(function GetAvailableJobs(
  roomName: string,
  filterOnTypes?: JobActionTypes[]
): FunctionReturn {
  let jobs = Memory.rooms[roomName].jobs
    .filter((j) => (filterOnTypes ? filterOnTypes.includes(j.action) : true))
    .filter(
      (j) =>
        j.assignedCreepsIds.length < j.maxCreeps &&
        j.assignedStructuresIds.length < j.maxStructures
    );

  if (jobs.length === 0)
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT, []);

  jobs = jobs.sort((a, b) => {
    return Number(a.hasPriority) - Number(b.hasPriority);
  });
  return FunctionReturnHelper(FunctionReturnCodes.OK, jobs);
});

export const AssignNewJobForStructure = FuncWrapper(
  function AssignNewJobForStructure(
    str: Structure,
    filterOnTypes?: JobActionTypes[]
  ): FunctionReturn {
    const strId: Id<Structure> = str.id;
    const strMem: StructureMemory = GetStructureMemory(strId).response;
    let jobs: Job[] = [];

    if (filterOnTypes) {
      jobs = GetAvailableJobs(strMem.room, filterOnTypes).response;
    } else {
      switch (str.structureType) {
        case "tower":
          jobs = GetAvailableJobs(strMem.room, ["attack"]).response;
          if (jobs.length === 0) {
            jobs = GetAvailableJobs(strMem.room, ["repair", "heal"]).response;
          }
          break;
        default:
          break;
      }
    }

    jobs = jobs.sort((x) => (x.hasPriority ? -1 : 1));

    const firstJob: Job | undefined = first(jobs);
    if (firstJob) {
      firstJob.assignedStructuresIds.push(strId);
      strMem.jobId = firstJob.id;
      return FunctionReturnHelper(FunctionReturnCodes.OK);
    }
    return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);
  }
);

export const AssignNewJobForCreep = FuncWrapper(function AssignNewJobForCreep(
  creepName: string,
  filterOnTypes?: JobActionTypes[]
): FunctionReturn {
  const creepMem: CreepMemory = GetCreepMemory(creepName).response;
  const creepType = creepMem.type;
  let jobs: Job[] = [];

  if (filterOnTypes) {
    jobs = GetAvailableJobs(creepMem.commandRoom, filterOnTypes).response;
  } else {
    switch (creepType) {
      case "attack":
        jobs = GetAvailableJobs(creepMem.commandRoom, ["attack"]).response;
        break;
      case "claim":
        jobs = GetAvailableJobs(creepMem.commandRoom, ["claim"]).response;
        break;
      case "heal":
        jobs = GetAvailableJobs(creepMem.commandRoom, ["heal"]).response;
        break;
      case "move":
        jobs = GetAvailableJobs(creepMem.commandRoom, ["move"]).response;
        break;
      case "pioneer":
        jobs = GetAvailableJobs(creepMem.commandRoom, [
          "transfer",
          "build",
          "repair",
          "dismantle",
        ]).response;
        break;
      case "transferring":
        jobs = GetAvailableJobs(creepMem.commandRoom, ["transfer"]).response;
        break;
      case "work":
        jobs = GetAvailableJobs(creepMem.commandRoom, [
          "build",
          "repair",
          "dismantle",
        ]).response;
        if (jobs.length === 0) {
          jobs = GetAvailableJobs(creepMem.commandRoom, ["upgrade"]).response;
        }
        break;
      default:
        break;
    }
  }

  jobs = jobs.sort((x) => (x.hasPriority ? -1 : 1));
  jobs = jobs.sort(
    (a, b) => a.assignedCreepsIds.length - b.assignedCreepsIds.length
  );
  jobs = jobs.sort(
    (a, b) => a.assignedStructuresIds.length - b.assignedStructuresIds.length
  );

  const firstJob: Job | undefined = first(jobs);
  if (firstJob) {
    firstJob.assignedCreepsIds.push(creepName);
    creepMem.jobId = firstJob.id;
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
  return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);
});

export const GetJobById = FuncWrapper(function GetJobById(
  id: Id<Job>,
  roomName: string
): FunctionReturn {
  const job: Job | undefined = Memory.rooms[roomName].jobs.find(
    (j) => j.id === id
  );
  if (isUndefined(job))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper(FunctionReturnCodes.OK, job);
});

export const UpdateJobById = FuncWrapper(function UpdateJobById(
  id: Id<Job>,
  job: Job,
  roomName: string
): FunctionReturn {
  const jobsMem = Memory.rooms[roomName].jobs;
  const index = jobsMem.findIndex((j) => j.id === id);
  if (index >= 0) {
    jobsMem[index] = job;
  } else {
    jobsMem.push(job);
  }
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const UpdateJobList = FuncWrapper(function UpdateJobList(
  roomName: string,
  jobs: Job[]
): FunctionReturn {
  Memory.rooms[roomName].jobs = jobs;
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const UnassignJob = FuncWrapper(function UnassignJob(
  jobId: Id<Job>,
  creepName: string,
  roomName: string
): FunctionReturn {
  const job: Job = GetJobById(jobId, roomName).response;
  remove(job.assignedCreepsIds, (id: string) => id === creepName);
  UpdateJobById(jobId, job, roomName);

  const creepMem: CreepMemory = GetCreepMemory(creepName).response;
  creepMem.jobId = undefined;
  UpdateCreepMemory(creepName, creepMem);

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const DeleteJobById = FuncWrapper(function DeleteJobById(
  id: Id<Job>,
  roomName: string
): FunctionReturn {
  const jobs: Job[] = GetJobs(roomName).response;
  const index = jobs.findIndex((j) => j.id === id);
  forEach(jobs[index].assignedCreepsIds, (name: string) => {
    const getCreepMemory = GetCreepMemory(name);
    if (getCreepMemory.code === FunctionReturnCodes.OK) {
      const creepMem: CreepMemory = getCreepMemory.response;
      creepMem.jobId = undefined;
      UpdateCreepMemory(name, creepMem);
    }
  });
  forEach(jobs[index].assignedStructuresIds, (strId: string) => {
    const getStrMemory = GetStructureMemory(strId as Id<Structure>);
    if (getStrMemory.code === FunctionReturnCodes.OK) {
      const strMem: StructureMemory = getStrMemory.response;
      strMem.jobId = undefined;
      UpdateStructureMemory(strId, strMem);
    }
  });
  remove(jobs, (j: Job) => j.id === id);
  UpdateJobList(roomName, jobs);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
