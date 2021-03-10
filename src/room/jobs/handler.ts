import { isUndefined, first, forEach, remove, groupBy } from "lodash";
import { FuncWrapper } from "../../utils/wrapper";
import { FunctionReturnHelper } from "../../utils/statusGenerator";
import { FunctionReturnCodes } from "../../utils/constants/global";
import { GetCreepMemory, UpdateCreepMemory } from "../../creep/helper";
import {
  GetStructureMemory,
  UpdateStructureMemory,
} from "../../structure/helper";
import { CreateRoomPosition } from "../../utils/helper";
import { JobActionPriority } from "../../utils/constants/room";

export const GetAllJobs = FuncWrapper(function GetAllJobs(
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
  requesterIsCreep: boolean,
  filterOnTypes?: JobActionTypes[]
): FunctionReturn {
  const jobs: Job[] = GetAllJobs(
    roomName,
    filterOnTypes
  ).response.filter((j: Job) =>
    requesterIsCreep
      ? j.assignedCreepsIds.length < j.maxCreeps
      : j.assignedStructuresIds.length < j.maxStructures
  );

  if (jobs.length === 0)
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT, []);

  return FunctionReturnHelper(FunctionReturnCodes.OK, jobs);
});

export const GetClosestJob = FuncWrapper(function GetClosestJob(
  jobs: Job[],
  pos: RoomPosition
): FunctionReturn {
  const jobsWithPos: Job[] = [];
  jobs
    .filter((job) => job.position)
    .forEach((job: Job) => {
      const _job = job;
      _job.position = CreateRoomPosition(job.position as RoomPosition).response;
      jobsWithPos.push(_job);
    });

  const closestJob: Job = first(
    jobsWithPos.sort(
      (a: Job, b: Job) =>
        (a.position as RoomPosition).getRangeTo(pos) -
        (b.position as RoomPosition).getRangeTo(pos)
    )
  ) as Job;

  return FunctionReturnHelper(FunctionReturnCodes.OK, closestJob);
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

export const SwitchCreepSavedJobIds = FuncWrapper(
  function SwitchCreepSavedJobIds(
    name: string,
    switchBack = false
  ): FunctionReturn {
    const creepMem: CreepMemory = GetCreepMemory(name).response;
    let id:string| undefined= undefined;
    if (switchBack) {
      id = creepMem.jobId;
      creepMem.jobId = creepMem.secondJobId;
      creepMem.secondJobId = id;
    } else {
      id = creepMem.secondJobId;
      creepMem.secondJobId = creepMem.jobId;
      creepMem.jobId = id;
    }

    UpdateCreepMemory(name, creepMem);
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const AssignNewJobForStructure = FuncWrapper(
  function AssignNewJobForStructure(
    str: Structure,
    filterOnTypes?: JobActionTypes[]
  ): FunctionReturn {
    const strId: Id<Structure> = str.id;
    const strMem: StructureMemory = GetStructureMemory(strId).response;
    let jobs: Job[] = [];

    if (filterOnTypes) {
      jobs = GetAvailableJobs(strMem.room, false, filterOnTypes).response;
    } else {
      switch (str.structureType) {
        case "tower":
          jobs = GetAvailableJobs(strMem.room, false, ["attack"]).response;
          if (jobs.length === 0) {
            jobs = GetAvailableJobs(strMem.room, false, ["repair", "heal"])
              .response;
          }
          break;
        default:
          break;
      }
    }

    if (jobs.length === 0)
      return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);

    const closestJob: Job = GetClosestJob(jobs, str.pos).response;
    closestJob.assignedStructuresIds.push(strId);
    UpdateJobById(closestJob.id, closestJob, closestJob.roomName);

    strMem.jobId = closestJob.id;
    UpdateStructureMemory(str.id, strMem);
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const AssignNewJobForCreep = FuncWrapper(function AssignNewJobForCreep(
  creep: Creep,
  filterOnTypes?: JobActionTypes[],
  forcedJob?:Job
): FunctionReturn {
  const creepMem: CreepMemory = GetCreepMemory(creep.name).response;
  let jobs: Job[] = [];

  if (forcedJob) {
    forcedJob.assignedCreepsIds.push(creep.name);
    UpdateJobById(forcedJob.id, forcedJob, forcedJob.roomName);
  
    creepMem.jobId = forcedJob.id;
    UpdateCreepMemory(creep.name, creepMem);
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }

  if (creepMem.secondJobId) {
    if (creepMem.jobId !== creepMem.secondJobId) {
      SwitchCreepSavedJobIds(creep.name, true);
      return FunctionReturnHelper(FunctionReturnCodes.OK);
    }
  }

  if (filterOnTypes) {
    jobs = GetAvailableJobs(creepMem.commandRoom, true, filterOnTypes).response;
  } else {
    switch (creepMem.type) {
      case "attack":
      case "claim":
      case "move":
      case "heal":
        jobs = GetAvailableJobs(creepMem.commandRoom, true, [creepMem.type])
          .response;
        break;
      case "pioneer":
        jobs = GetAvailableJobs(
          creepMem.commandRoom,
          true,
          creep.store.getUsedCapacity() < creep.store.getCapacity()
            ? [
                "harvest",
                "transfer",
                "dismantle",
                "build",
                "repair",
                "dismantle",
              ]
            : ["transfer", "dismantle", "build", "repair", "dismantle","upgrade"]
        ).response;
        break;
      case "transferring":
        jobs = GetAvailableJobs(creepMem.commandRoom, true, ["transfer"])
          .response;
        break;
      case "work":
        jobs = GetAvailableJobs(
          creepMem.commandRoom,
          true,
          creep.store.getUsedCapacity() < creep.store.getCapacity()
            ? ["harvest", "dismantle", "build", "repair", "dismantle","upgrade"]
            : ["dismantle", "build", "repair", "dismantle"]
        ).response;
        break;
      default:
        break;
    }
  }

  if (jobs.length === 0)
    return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);

    const jobsGroupedByPrioritize:StringMap<Job[]> = {};
    let highestPriorityJobsNumber:number = 99;
    forEach(jobs, (j:Job) => {
      const num = JobActionPriority[j.action];
      if (highestPriorityJobsNumber > num) {
        highestPriorityJobsNumber = num;
      }

      if (isUndefined(jobsGroupedByPrioritize[num])) jobsGroupedByPrioritize[num]=[];
      jobsGroupedByPrioritize[num].push(j);
    });

  const closestJob: Job = GetClosestJob(jobsGroupedByPrioritize[highestPriorityJobsNumber], creep.pos).response;
  closestJob.assignedCreepsIds.push(creep.name);
  UpdateJobById(closestJob.id, closestJob, closestJob.roomName);

  creepMem.jobId = closestJob.id;
  UpdateCreepMemory(creep.name, creepMem);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const GetJobById = FuncWrapper(function GetJobById(
  id: Id<Job>,
  roomName: string
): FunctionReturn {
  const job: Job | undefined = GetAllJobs(roomName).response.find(
    (j: Job) => j.id === id
  );

  if (isUndefined(job))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper(FunctionReturnCodes.OK, job);
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
  id: string,
  roomName: string
): FunctionReturn {
  const job: Job = GetJobById(jobId, roomName).response;
  const removedStructuresIds = remove(
    job.assignedStructuresIds,
    (strId: string) => strId === id
  );
  const removedCreepsIds = remove(
    job.assignedCreepsIds,
    (creepId: string) => creepId === id
  );
  UpdateJobById(jobId, job, roomName);

  if (removedCreepsIds.length > 0) {
    const creepMem: CreepMemory = GetCreepMemory(id).response;
    if (creepMem.jobId === jobId) {
      creepMem.jobId = undefined;
    } else if (creepMem.secondJobId === jobId) {
      creepMem.secondJobId = undefined;
    }
    UpdateCreepMemory(id, creepMem);
  }
  if (removedStructuresIds.length > 0) {
    const strMem: StructureMemory = GetStructureMemory(id as Id<Structure>)
      .response;
    strMem.jobId = undefined;
    UpdateStructureMemory(id, strMem);
  }

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const DeleteJobById = FuncWrapper(function DeleteJobById(
  id: Id<Job>,
  roomName: string
): FunctionReturn {
  const jobs: Job[] = GetAllJobs(roomName).response;
  const index = jobs.findIndex((j) => j.id === id);
  forEach(jobs[index].assignedCreepsIds, (name: string) => {
    const getCreepMemory = GetCreepMemory(name);
    if (getCreepMemory.code === FunctionReturnCodes.OK) {
      const creepMem: CreepMemory = getCreepMemory.response;
      if (creepMem.jobId === id) {
        creepMem.jobId = undefined;
      } else {
        creepMem.secondJobId = undefined;
      }

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
