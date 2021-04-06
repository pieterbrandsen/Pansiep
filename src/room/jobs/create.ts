import { isUndefined } from "lodash";
import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/statusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { GetAccesSpotsAroundPosition } from "../reading";
import { UpdateJobById } from "./handler";

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
  room: Room,
  hasPriority = false
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
    hasPriority,
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
