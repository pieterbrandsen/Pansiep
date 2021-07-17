import { isUndefined } from "lodash";
import { FunctionReturnCodes } from "../../utils/constants/global";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { GetAccesSpotsAroundPosition } from "../reading";
import { UpdateJobById } from "./handler";

/**
 * Create an harvest job
 *
 * @param {jobId} jobId - Id of job
 * @param {Source} source - Source to harvest
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const CreateHarvestJob = FuncWrapper(function CreateHarvestJob(
  jobId: Id<Job>,
  source: Source
): FunctionReturn {
  const getAccesSpotsAroundPosition = GetAccesSpotsAroundPosition(
    source.room,
    source.pos,
    1
  );
  if (getAccesSpotsAroundPosition.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(getAccesSpotsAroundPosition.code);
  const openSpots: number = getAccesSpotsAroundPosition.response;
  const job: Job = {
    id: jobId,
    action: "harvest",
    updateJobAtTick: Game.time + 100,
    assignedCreepsNames: [],
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

/**
 * Create an heal job
 *
 * @param {Creep} creep - Creep to heal
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const CreateHealJob = FuncWrapper(function CreateHealJob(
  creep: Creep
): FunctionReturn {
  const jobId: Id<Job> = `heal-${creep.name}` as Id<Job>;
  const job: Job = {
    id: jobId,
    action: "heal",
    updateJobAtTick: Game.time + 500,
    assignedCreepsNames: [],
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

/**
 * Create an move job
 *
 * @param {Id<Job>} jobId - Id of job
 * @param {string} roomName - Name of room
 * @param {RoomPosition} [pos] - Position to move to
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const CreateMoveJob = FuncWrapper(function CreateMoveJob(
  jobId: Id<Job>,
  roomName: string,
  pos: RoomPosition = new RoomPosition(25, 25, roomName)
): FunctionReturn {
  const job: Job = {
    id: jobId,
    action: "move",
    updateJobAtTick: Game.time + 500,
    assignedCreepsNames: [],
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

/**
 * Create an build job
 *
 * @param {Room} room - Room to build in
 * @param {RoomPosition} pos - Position to build at
 * @param {StructureConstant} structureType - Type of structure to create
 * @param {boolean} [hasPriority] - Must be focussed to be completed
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const CreateBuildJob = FuncWrapper(function CreateBuildJob(
  room: Room,
  pos: RoomPosition,
  structureType: StructureConstant,
  hasPriority = false
): FunctionReturn {
  const jobId: Id<Job> = `build-${pos.x}/${pos.y}-${structureType}` as Id<Job>;
  const getAccesSpotsAroundPosition = GetAccesSpotsAroundPosition(room, pos, 2);
  if (getAccesSpotsAroundPosition.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(getAccesSpotsAroundPosition.code);
  const openSpots: number = getAccesSpotsAroundPosition.response;
  const constructionCost = CONSTRUCTION_COST[structureType];
  const job: Job = {
    id: jobId,
    action: "build",
    updateJobAtTick: Game.time + 1,
    assignedCreepsNames: [],
    maxCreeps: openSpots,
    assignedStructuresIds: [],
    maxStructures: 99,
    roomName: room.name,
    objId: "undefined" as Id<ConstructionSite>,
    hasPriority,
    position: pos,
    energyRequired: constructionCost,
  };
  UpdateJobById(jobId, job, room.name);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

/**
 * Create an withdraw job
 *
 * @param {Structure} str - Structure to withdraw from
 * @param {Id<Job>} jobId - Id of job
 * @param {number} energyRequired - Energy required to withdraw before job is completed
 * @param {ResourceConstant} resourceType - Type of resource
 * @param {JobActionTypes} action - Job action
 * @param {boolean} hasPriority - Must be focussed to be completed
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const CreateWithdrawJob = FuncWrapper(function CreateWithdrawJob(
  str: Structure,
  jobId: Id<Job>,
  energyRequired: number,
  resourceType: ResourceConstant,
  action: JobActionTypes,
  hasPriority = false
): FunctionReturn {
  const getAccesSpotsAroundPosition = GetAccesSpotsAroundPosition(
    str.room,
    str.pos,
    1
  );
  if (getAccesSpotsAroundPosition.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(getAccesSpotsAroundPosition.code);
  const openSpots: number = getAccesSpotsAroundPosition.response;
  const job: Job = {
    id: jobId,
    action,
    updateJobAtTick: Game.time + 500,
    assignedCreepsNames: [],
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

/**
 * Create an transfer job
 *
 * @param {Structure} str - Structure to transfer from
 * @param {Id<Job>} jobId - Id of job
 * @param {number} energyRequired - Energy required to transfer before job is completed
 * @param {ResourceConstant} resourceType - Type of resource
 * @param {JobActionTypes} action - Job action
 * @param {boolean} hasPriority - Must be focussed to be completed
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const CreateTransferJob = FuncWrapper(function CreateTransferJob(
  str: Structure,
  jobId: Id<Job>,
  energyRequired: number,
  resourceType: ResourceConstant,
  hasPriority = false,
  action: JobActionTypes
): FunctionReturn {
  const getAccesSpotsAroundPosition = GetAccesSpotsAroundPosition(
    str.room,
    str.pos,
    1
  );
  if (getAccesSpotsAroundPosition.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(getAccesSpotsAroundPosition.code);
  const openSpots: number = getAccesSpotsAroundPosition.response;
  const job: Job = {
    id: jobId,
    action,
    updateJobAtTick: Game.time + 500,
    assignedCreepsNames: [],
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

/**
 * Create an upgrade job
 *
 * @param {Room} room - Room to upgrade in
 * @param {boolean} hasPriority - Must be focussed to be completed
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const CreateUpgradeJob = FuncWrapper(function CreateUpgradeJob(
  room: Room,
  hasPriority = false
): FunctionReturn {
  if (isUndefined(room.controller)) {
    return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);
  }

  const { pos } = room.controller;
  const jobId: Id<Job> = `upgrade-${pos.x}/${pos.y}` as Id<Job>;
  const getAccesSpotsAroundPosition = GetAccesSpotsAroundPosition(room, pos, 2);
  if (getAccesSpotsAroundPosition.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(getAccesSpotsAroundPosition.code);
  const openSpots: number = getAccesSpotsAroundPosition.response;
  const job: Job = {
    id: jobId,
    action: "upgrade",
    updateJobAtTick: Game.time + 500,
    assignedCreepsNames: [],
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

/**
 * Create an repair job
 *
 * @param {Room} room - Room to repair in
 * @param {Id<Job>} jobId - Id of job
 * @param {boolean} hasPriority - Must be focussed to be completed
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const CreateRepairJob = FuncWrapper(function CreateRepairJob(
  str: Structure,
  jobId: Id<Job>,
  hasPriority = false
): FunctionReturn {
  const getAccesSpotsAroundPosition = GetAccesSpotsAroundPosition(
    str.room,
    str.pos,
    2
  );
  if (getAccesSpotsAroundPosition.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(getAccesSpotsAroundPosition.code);
  const openSpots: number = getAccesSpotsAroundPosition.response;
  const job: Job = {
    id: jobId,
    action: "repair",
    updateJobAtTick: Game.time + 500,
    assignedCreepsNames: [],
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
