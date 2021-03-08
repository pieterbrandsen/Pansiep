import { isUndefined, first, forEach, remove } from "lodash";
import { FuncWrapper } from "../utils/wrapper";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { FunctionReturnCodes } from "../utils/constants/global";
import { GetCreepMemory, UpdateCreepMemory } from "../creep/helper";
import { GetStructureMemory, UpdateStructureMemory } from "../structure/helper";
import { GetAccesSpotsAroundPosition } from "./reading";
import { CreateRoomPosition } from "../utils/helper";

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
  const jobs: Job[] = GetJobs(roomName, filterOnTypes).response.filter(
    (j: Job) =>
      j.assignedCreepsIds.length < j.maxCreeps &&
      j.assignedStructuresIds.length < j.maxStructures
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
  return FunctionReturnHelper(
    FunctionReturnCodes.OK,
    first(
      jobsWithPos.sort(
        (a: Job, b: Job) =>
          (a.position as RoomPosition).getRangeTo(pos) -
          (b.position as RoomPosition).getRangeTo(pos)
      )
    )
  );
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

    const closestJob: Job = GetClosestJob(jobs, str.pos).response;
    if (closestJob) {
      closestJob.assignedStructuresIds.push(strId);
      UpdateJobById(closestJob.id, closestJob, closestJob.roomName);
      strMem.jobId = closestJob.id;
      UpdateStructureMemory(str.id, strMem);
      return FunctionReturnHelper(FunctionReturnCodes.OK);
    }
    return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);
  }
);

export const SwitchCreepSavedJobIds = FuncWrapper(
  function SwitchCreepSavedJobIds(
    name: string,
    switchBack = false
  ): FunctionReturn {
    const creepMem: CreepMemory = GetCreepMemory(name).response;
    if (switchBack) {
      const { jobId } = creepMem;
      creepMem.jobId = creepMem.secondJobId;
      creepMem.secondJobId = jobId;
    } else {
      const jobId = creepMem.secondJobId;
      creepMem.secondJobId = creepMem.jobId;
      creepMem.jobId = jobId;
    }
    UpdateCreepMemory(name, creepMem);
    return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
);

export const AssignNewJobForCreep = FuncWrapper(function AssignNewJobForCreep(
  creep: Creep,
  filterOnTypes?: JobActionTypes[]
): FunctionReturn {
  const creepMem: CreepMemory = GetCreepMemory(creep.name).response;
  const creepType = creepMem.type;

  let jobs: Job[] = [];
  let otherJobs: Job[] = [];

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
        if (jobs.length === 0)
        jobs = GetAvailableJobs(creepMem.commandRoom, ["upgrade"]).response;
        break;
      case "transferring":
        jobs = GetAvailableJobs(creepMem.commandRoom, ["transfer"]).response;
        break;
      case "work":
        jobs = GetAvailableJobs(creepMem.commandRoom, [
            "harvest",
            "build",
            "repair",
            "dismantle",
          ]).response;
          if (jobs.length === 0)
            jobs = GetAvailableJobs(creepMem.commandRoom, ["upgrade"]).response;
        break;
      default:
        break;
    }
  }

  jobs = jobs.sort((x) => (x.hasPriority ? -1 : 1));

  const closestJob: Job = GetClosestJob(jobs, creep.pos).response;
  if (closestJob) {
    closestJob.assignedCreepsIds.push(creep.name);
    UpdateJobById(closestJob.id, closestJob, closestJob.roomName);
    creepMem.jobId = closestJob.id;
    UpdateCreepMemory(creep.name, creepMem);
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

export const CreateHarvestJob = FuncWrapper(function CreateHarvestJob(
  jobId: Id<Job>,
  source: Source
): FunctionReturn {
  const openSpots: number = GetAccesSpotsAroundPosition(
    source.room,
    source.pos,
    1
  ).response;
  const job: Job = {
    id: jobId,
    action: "harvest",
    updateJobAtTick: Game.time + 100,
    assignedCreepsIds: [],
    maxCreeps: openSpots,
    assignedStructuresIds: [],
    maxStructures: 99,
    roomName: source.room.name,
    objId: source.id,
    hasPriority: true,
    resourceType: RESOURCE_ENERGY,
    position: source.pos,
  };
  UpdateJobById(jobId, job, source.room.name);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const CreateHealJob = FuncWrapper(function CreateHealJob(
  creep: Creep
): FunctionReturn {
  const jobId: Id<Job> = `heal-${creep.name}` as Id<Job>;
  const job: Job = {
    id: jobId,
    action: "heal",
    updateJobAtTick: Game.time + 500,
    assignedCreepsIds: [],
    maxCreeps: 1,
    assignedStructuresIds: [],
    maxStructures: 99,
    roomName: creep.room.name,
    objId: creep.id,
    hasPriority: false,
    position: creep.pos,
  };
  UpdateJobById(jobId, job, creep.room.name);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const CreateMoveJob = FuncWrapper(function CreateMoveJob(
  jobId: Id<Job>,
  roomName: string,
  pos: RoomPosition = new RoomPosition(25, 25, roomName)
): FunctionReturn {
  const job: Job = {
    id: jobId,
    action: "move",
    updateJobAtTick: Game.time + 500,
    assignedCreepsIds: [],
    maxCreeps: 1,
    assignedStructuresIds: [],
    maxStructures: 99,
    roomName,
    objId: "UNDEFINED" as Id<Structure>,
    hasPriority: false,
    position: pos,
  };
  UpdateJobById(jobId, job, roomName);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const CreateBuildJob = FuncWrapper(function CreateBuildJob(
  room: Room,
  pos: RoomPosition,
  structureType: StructureConstant,
  hasPriority = false
): FunctionReturn {
  const jobId: Id<Job> = `build-${pos.x}/${pos.y}-${structureType}` as Id<Job>;
  const openSpots: number = GetAccesSpotsAroundPosition(room, pos, 2).response;
  const structureCost = CONSTRUCTION_COST[structureType];
  const job: Job = {
    id: jobId,
    action: "build",
    updateJobAtTick: Game.time + 1,
    assignedCreepsIds: [],
    maxCreeps: openSpots,
    assignedStructuresIds: [],
    maxStructures: 99,
    roomName: room.name,
    objId: "undefined" as Id<ConstructionSite>,
    hasPriority,
    position: pos,
    energyRequired: structureCost,
  };
  UpdateJobById(jobId, job, room.name);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const CreateWithdrawJob = FuncWrapper(function CreateWithdrawJob(
  str: Structure,
  jobId: Id<Job>,
  energyRequired: number,
  resourceType: ResourceConstant,
  action: JobActionTypes,
  hasPriority = false
): FunctionReturn {
  const openSpots: number = GetAccesSpotsAroundPosition(str.room, str.pos, 1)
    .response;
  const job: Job = {
    id: jobId,
    action,
    updateJobAtTick: Game.time + 500,
    assignedCreepsIds: [],
    maxCreeps: openSpots > 1 ? openSpots - 1 : openSpots,
    assignedStructuresIds: [],
    maxStructures: 3,
    roomName: str.room.name,
    objId: str.id,
    hasPriority,
    position: str.pos,
    energyRequired,
    resourceType,
  };
  UpdateJobById(jobId, job, str.room.name);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const CreateTransferJob = FuncWrapper(function CreateTransferJob(
  str: Structure,
  jobId: Id<Job>,
  energyRequired: number,
  resourceType: ResourceConstant,
  hasPriority = false,
  action: JobActionTypes
): FunctionReturn {
  const openSpots: number = GetAccesSpotsAroundPosition(str.room, str.pos, 1)
    .response;
  const job: Job = {
    id: jobId,
    action,
    updateJobAtTick: Game.time + 500,
    assignedCreepsIds: [],
    maxCreeps: openSpots > 1 ? openSpots - 1 : openSpots,
    assignedStructuresIds: [],
    maxStructures: 99,
    roomName: str.room.name,
    objId: str.id,
    hasPriority,
    position: str.pos,
    energyRequired: energyRequired * -1,
    resourceType,
  };
  UpdateJobById(jobId, job, str.room.name);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const CreateUpgradeJob = FuncWrapper(function CreateUpgradeJob(
  room: Room
): FunctionReturn {
  if (isUndefined(room.controller)) {
    return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);
  }

  const { pos } = room.controller;
  const jobId: Id<Job> = `upgrade-${pos.x}/${pos.y}` as Id<Job>;
  const openSpots: number = GetAccesSpotsAroundPosition(room, pos, 2).response;
  const job: Job = {
    id: jobId,
    action: "upgrade",
    updateJobAtTick: Game.time + 500,
    assignedCreepsIds: [],
    maxCreeps: openSpots,
    assignedStructuresIds: [],
    maxStructures: 99,
    roomName: room.name,
    objId: room.controller.id,
    hasPriority: false,
    position: pos,
    energyRequired: 5000,
  };
  UpdateJobById(jobId, job, room.name);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const CreateRepairJob = FuncWrapper(function CreateRepairJob(
  str: Structure,
  jobId: Id<Job>,
  hasPriority = false
): FunctionReturn {
  const openSpots: number = GetAccesSpotsAroundPosition(str.room, str.pos, 2)
    .response;
  const job: Job = {
    id: jobId,
    action: "repair",
    updateJobAtTick: Game.time + 500,
    assignedCreepsIds: [],
    maxCreeps: openSpots,
    assignedStructuresIds: [],
    maxStructures: 3,
    roomName: str.room.name,
    objId: str.id,
    hasPriority,
    position: str.pos,
    energyRequired: (str.hitsMax - str.hits) / 100,
  };
  UpdateJobById(jobId, job, str.room.name);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
