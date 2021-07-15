import { isUndefined, first, forEach, remove } from "lodash";
import { FuncWrapper } from "../../utils/wrapper";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FunctionReturnCodes } from "../../utils/constants/global";
import { GetCreepMemory, UpdateCreepMemory } from "../../creep/helper";
import {
  GetStructureMemory,
  UpdateStructureMemory,
} from "../../structure/helper";
import { CreateRoomPosition } from "../../utils/helper";
import { JobActionPriority } from "../../utils/constants/room";

/**
 * Return all jobs from an requested room
 *
 * @param {string} roomName - Name of room
 * @param {JobActionTypes[]} [filterOnTypes] - filter on selected job types
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
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

/**
 * Return all available jobs from an requested room
 *
 * @param {string} roomName - Name of room
 * @param {boolean} requesterIsCreep - If requester is an creep
 * @param {JobActionTypes[]} [filterOnTypes] - filter on selected job types
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetAvailableJobs = FuncWrapper(function GetAvailableJobs(
  roomName: string,
  requesterIsCreep: boolean,
  filterOnTypes?: JobActionTypes[]
): FunctionReturn {
  const getAllJobs = GetAllJobs(roomName, filterOnTypes);
  if (getAllJobs.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(getAllJobs.code);
  const jobs: Job[] = getAllJobs.response.filter((j: Job) =>
    requesterIsCreep
      ? j.assignedCreepsNames.length < j.maxCreeps
      : j.assignedStructuresIds.length < j.maxStructures
  );

  if (jobs.length === 0)
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT, []);

  return FunctionReturnHelper(FunctionReturnCodes.OK, jobs);
});

/**
 * Return closest job to inputted position
 *
 * @param {Job[]} jobs - Jobs to use when getting closest job
 * @param {RoomPosition} pos - Middle position
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetClosestJob = FuncWrapper(function GetClosestJob(
  jobs: Job[],
  pos: RoomPosition
): FunctionReturn {
  const jobsWithPos: Job[] = [];
  jobs
    .filter((job) => job.position)
    .forEach((job: Job) => {
      const _job = job;
      const createRoomPosition = CreateRoomPosition(
        job.position as RoomPosition
      );
      if (createRoomPosition.code === FunctionReturnCodes.OK) {
        _job.position = createRoomPosition.response;
        jobsWithPos.push(_job);
      }
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

/**
 * Update job with new memory
 *
 * @param {Id<Job>} id - Id of job
 * @param {Job} job - Updated job
 * @param {string} roomName - Name of room
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
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

/**
 * Switch creep jobs saved in memory
 *
 * @param {string} name - Name of creep
 * @param {boolean=false} switchBack - Switch from secondary job to first
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const SwitchCreepSavedJobIds = FuncWrapper(
  function SwitchCreepSavedJobIds(
    creepName: string,
    switchBack = false
  ): FunctionReturn {
    const getCreepMemory = GetCreepMemory(creepName);
    if (getCreepMemory.code !== FunctionReturnCodes.OK)
      return FunctionReturnHelper(getCreepMemory.code);
    const creepMem: CreepMemory = getCreepMemory.response;
    let oldId: Id<Job> | undefined;
    if (switchBack) {
      oldId = creepMem.jobId;
      creepMem.jobId = creepMem.secondJobId;
      creepMem.secondJobId = oldId;
    } else {
      oldId = creepMem.secondJobId;
      creepMem.secondJobId = creepMem.jobId;
      creepMem.jobId = oldId;
    }

    UpdateCreepMemory(creepName, creepMem);
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

/**
 * Assigns new job to an structure
 *
 * @param {Structure} str - Actual structure
 * @param {JobActionTypes[]} [filterOnTypes] - Only return inputted job types
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const AssignNewJobForStructure = FuncWrapper(
  function AssignNewJobForStructure(
    str: Structure,
    filterOnTypes?: JobActionTypes[]
  ): FunctionReturn {
    const strId: Id<Structure> = str.id;
    const getStructureMemory = GetStructureMemory(strId);
    if (getStructureMemory.code !== FunctionReturnCodes.OK)
      return FunctionReturnHelper(getStructureMemory.code);
    const strMem: StructureMemory = getStructureMemory.response;
    let jobs: Job[] = [];

    let getAvailableJobs: FunctionReturn = { code: FunctionReturnCodes.NOT_MODIFIED};
    if (filterOnTypes) {
      getAvailableJobs = GetAvailableJobs(strMem.room, false, filterOnTypes);
      if (getAvailableJobs.code !== FunctionReturnCodes.OK)
        return FunctionReturnHelper(getAvailableJobs.code);
      jobs = getAvailableJobs.response;
    } else {
      switch (str.structureType) {
        case "tower":
          getAvailableJobs = GetAvailableJobs(strMem.room, false, ["attack"]);
          jobs = getAvailableJobs.response;
          if (getAvailableJobs.code === FunctionReturnCodes.OK && jobs.length === 0) {
            getAvailableJobs = GetAvailableJobs(strMem.room, false, [
              "repair",
              "heal",
            ]);
            jobs = getAvailableJobs.response;
          }
          break;
        default:
          break;
      }
    }

    if (getAvailableJobs.code !== FunctionReturnCodes.OK || jobs.length === 0)
      return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);

    const getClosestJob = GetClosestJob(jobs, str.pos);
    if (getClosestJob.code !== FunctionReturnCodes.OK)
      return FunctionReturnHelper(getClosestJob.code);
    const closestJob: Job = getClosestJob.response;
    closestJob.assignedStructuresIds.push(strId);
    UpdateJobById(closestJob.id, closestJob, closestJob.roomName);

    strMem.jobId = closestJob.id;
    UpdateStructureMemory(str.id, strMem);
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

/**
 * Assigns new job to an creep
 *
 * @param {Creep} creep - Actual creep
 * @param {JobActionTypes[]} [filterOnTypes] - Only return inputted job types
 * @param {Job} [forcedJob] - Input an job
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const AssignNewJobForCreep = FuncWrapper(function AssignNewJobForCreep(
  creep: Creep,
  filterOnTypes?: JobActionTypes[],
  forcedJob?: Job
): FunctionReturn {
  const getCreepMemory = GetCreepMemory(creep.name);
  if (getCreepMemory.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(getCreepMemory.code);
  const creepMem: CreepMemory = getCreepMemory.response;
  let jobs: Job[] = [];

  if (forcedJob) {
    forcedJob.assignedCreepsNames.push(creep.name);
    UpdateJobById(forcedJob.id, forcedJob, forcedJob.roomName);

    creepMem.jobId = forcedJob.id;
    UpdateCreepMemory(creep.name, creepMem);
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }

  if (creepMem.secondJobId) {
  if (creepMem.jobId !== creepMem.secondJobId) {
      SwitchCreepSavedJobIds(creep.id, true);
      return FunctionReturnHelper(FunctionReturnCodes.OK);
    }
  }

  let getAvailableJobs: FunctionReturn = {
    code: FunctionReturnCodes.INTERNAL_SERVER_ERROR,
  };
  if (filterOnTypes) {
    getAvailableJobs = GetAvailableJobs(
      creepMem.commandRoom,
      true,
      filterOnTypes
    );
  } else {
    switch (creepMem.type) {
      case "attack":
      case "claim":
      case "move":
      case "heal":
        getAvailableJobs = GetAvailableJobs(creepMem.commandRoom, true, [
          creepMem.type,
        ]);
        break;
      case "pioneer":
        getAvailableJobs = GetAvailableJobs(
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
            : [
                "transfer",
                "dismantle",
                "build",
                "repair",
                "dismantle",
                "upgrade",
              ]
        );
        break;
      case "transferring":
        getAvailableJobs = GetAvailableJobs(creepMem.commandRoom, true, [
          "transfer",
        ]);
        break;
      case "work":
        getAvailableJobs = GetAvailableJobs(
          creepMem.commandRoom,
          true,
          creep.store.getUsedCapacity() < creep.store.getCapacity()
            ? [
                "harvest",
                "dismantle",
                "build",
                "repair",
                "dismantle",
                "upgrade",
              ]
            : ["dismantle", "build", "repair", "dismantle"]
        );
        break;
      default:
        break;
    }
  }

  if (getAvailableJobs.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(getAvailableJobs.code);
  jobs = getAvailableJobs.response;
  if (jobs.length === 0)
    return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);

  const jobsGroupedByPrioritize: StringMap<Job[]> = {};
  let highestPriorityJobsNumber = 99;
  forEach(jobs, (j: Job) => {
    const num = JobActionPriority[j.action];
    if (highestPriorityJobsNumber > num) {
      highestPriorityJobsNumber = num;
    }

    if (isUndefined(jobsGroupedByPrioritize[num]))
      jobsGroupedByPrioritize[num] = [];
    jobsGroupedByPrioritize[num].push(j);
  });

  const getClosestJob = GetClosestJob(
    jobsGroupedByPrioritize[highestPriorityJobsNumber],
    creep.pos
  );
  if (getClosestJob.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(getClosestJob.code);
  const closestJob: Job = getClosestJob.response;
  closestJob.assignedCreepsNames.push(creep.name);
  UpdateJobById(closestJob.id, closestJob, closestJob.roomName);

  creepMem.jobId = closestJob.id;
  UpdateCreepMemory(creep.name, creepMem);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

/**
 * Fetch job
 *
 * @param {Id<Job>} id - Id of job
 * @param {string} roomName - Room name to search job in
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetJobById = FuncWrapper(function GetJobById(
  id: Id<Job>,
  roomName: string
): FunctionReturn {
  const getAllJobs = GetAllJobs(roomName);
  if (getAllJobs.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(getAllJobs.code);
  const job: Job | undefined = getAllJobs.response.find(
    (j: Job) => j.id === id
  );

  if (isUndefined(job))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper(FunctionReturnCodes.OK, job);
});

/**
 * Update full job list
 *
 * @param {string} roomName - Room name to update jobs in
 * @param {Job[]} jobs - List of updated jobs
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const UpdateJobList = FuncWrapper(function UpdateJobList(
  roomName: string,
  jobs: Job[]
): FunctionReturn {
  Memory.rooms[roomName].jobs = jobs;
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

/**
 * Unassign job from creep or structure
 *
 * @param {Id<Job>} jobId - Id of job
 * @param {Id<Structure | Creep>} id - Id of object to unassign job from/
 * @param {string} roomName - Name of room
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const UnassignJob = FuncWrapper(function UnassignJob(
  jobId: Id<Job>,
  id: Id<Structure> | string,
  roomName: string
): FunctionReturn {
  const getJobById = GetJobById(jobId, roomName);
  if (getJobById.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(getJobById.code);
  const job: Job = getJobById.response;
  const removedStructuresIds = remove(
    job.assignedStructuresIds,
    (strId: string) => strId === id
  );
  const removedCreepsIds = remove(
    job.assignedCreepsNames,
    (name: string) => name === id
  );
  UpdateJobById(jobId, job, roomName);

  if (removedCreepsIds.length > 0) {
    const getCreepMemory = GetCreepMemory(id);
    if (getCreepMemory.code === FunctionReturnCodes.OK) {
      const creepMem: CreepMemory = getCreepMemory.response;
      if (creepMem.jobId === jobId) {
        creepMem.jobId = undefined;
      } else if (creepMem.secondJobId === jobId) {
        creepMem.secondJobId = undefined;
      }
      UpdateCreepMemory(id, creepMem);
    }
  }
  if (removedStructuresIds.length > 0) {
    const getStructureMemory = GetStructureMemory(id as Id<Structure>);
    if (getStructureMemory.code === FunctionReturnCodes.OK) {
      const strMem: StructureMemory = getStructureMemory.response;
      strMem.jobId = undefined;
      UpdateStructureMemory(id as Id<Structure>, strMem);
    }
  }

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

/**
 * Delete job and unassign job for all creep and structure
 *
 * @param {Id<Job>} jobId - Id of job
 * @param {string} roomName - Name of room
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const DeleteJobById = FuncWrapper(function DeleteJobById(
  id: Id<Job>,
  roomName: string
): FunctionReturn {
  const getAllJobs = GetAllJobs(roomName);
  if (getAllJobs.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(getAllJobs.code);
  const jobs: Job[] = getAllJobs.response;
  const index = jobs.findIndex((j) => j.id === id);
  forEach(jobs[index].assignedCreepsNames, (name: string) => {
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
  forEach(jobs[index].assignedStructuresIds, (strId: Id<Structure>) => {
    const getStrMemory = GetStructureMemory(strId);
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
