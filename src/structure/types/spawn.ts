import { forEach, forOwn, reduce, isUndefined } from "lodash";
import { GetAllCreepsMemory } from "../../creep/helper";
import { InitializeCreepMemory } from "../../memory/initialization";
import { GetRoom } from "../../room/helper";
import { GetAllJobs } from "../../room/jobs/handler";
import { FunctionReturnCodes, LogTypes } from "../../utils/constants/global";
import { MaxCreepsPerCreepType } from "../../utils/constants/room";
import { Log } from "../../utils/logger";
import { FunctionReturnHelper } from "../../utils/functionStatusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { RepairIfDamagedStructure, TryToCreateTransferJob } from "./helper";

/**
 * Get job actions array that are not at max creeps.
 *
 * @param {string} id - Id of creep
 * @param {boolean} usePriorityJobs - Id of creep
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
type JobActionObj = { usableCreeps: number; wantedCreeps: number };
export const GetJobActionsWithCreepNeed = FuncWrapper(
  function GetJobActionsWithCreepNeed(
    roomName: string,
    usePriorityJobs: boolean
  ): FunctionReturn {
    const getAllJobs = GetAllJobs(roomName);
    if (getAllJobs.code !== FunctionReturnCodes.OK) return FunctionReturnHelper(getAllJobs.code);
    let jobs:Job[] = getAllJobs.response;

    const priorityJobs: Job[] = jobs.filter((j: Job) => j.hasPriority);
    if (usePriorityJobs && priorityJobs.length > 0) {
      jobs = priorityJobs;
    }

    const jobActionTypesObj: StringMap<JobActionObj> = {};
    forEach(jobs, (job: Job) => {
      if (!jobActionTypesObj[job.action])
        jobActionTypesObj[job.action] = { usableCreeps: 0, wantedCreeps: 0 };
      jobActionTypesObj[job.action].wantedCreeps +=
        job.maxCreeps - job.assignedCreepsIds.length;
    });

    const jobActionTypes: JobActionTypes[] = [];
    forOwn(jobActionTypesObj, (job: JobActionObj, key: string) => {
      let getAllCreepsMemory:FunctionReturn = {code: FunctionReturnCodes.BAD_REQUEST};
      switch (key) {
        case "move":
          getAllCreepsMemory = GetAllCreepsMemory(roomName, ["move"]);
          break;
        case "transfer":
        case "withdraw":
          getAllCreepsMemory = GetAllCreepsMemory(roomName, [
            "transferring",
          ]);
          break;
        case "harvest":
        case "build":
        case "repair":
        case "dismantle":
        case "upgrade":
          getAllCreepsMemory = GetAllCreepsMemory(roomName, ["work"]);
          break;
        case "attack":
          getAllCreepsMemory = GetAllCreepsMemory(roomName, ["attack"]);
          break;
        case "claim":
          getAllCreepsMemory = GetAllCreepsMemory(roomName, ["claim"]);
          break;
        case "heal":
          getAllCreepsMemory = GetAllCreepsMemory(roomName, ["heal"]);
          break;
        default:
          break;
      }

      if (getAllCreepsMemory.code !== FunctionReturnCodes.OK) {
      const usableCreeps = getAllCreepsMemory.response.length;
        if (usableCreeps < MaxCreepsPerCreepType &&
          usableCreeps < job.wantedCreeps
        ) {
          jobActionTypes.push(key as JobActionTypes);
        }
      }
    });

    return FunctionReturnHelper(FunctionReturnCodes.OK, jobActionTypes);
  }
);

/**
 * Return job type that needs to be fulfilled next spawn.
 *
 * @param {StructureContainer} roomName - name of room
 * @param {StructureContainer} usePriorityJobs - if there are any jobs with priority, those get used in assigning a job.
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetNextCreepType = FuncWrapper(function GetNextCreepType(
  roomName: string,
  usePriorityJobs:boolean = false
): FunctionReturn {
  const getRoom = GetRoom(roomName);
  if (getRoom.code !== FunctionReturnCodes.OK) return FunctionReturnHelper(getRoom.code);
  const room: Room = getRoom.response;
    if (
      room && (room.energyCapacityAvailable <= 300 ||
      (room.energyCapacityAvailable / 4 > room.energyAvailable &&
        room.energyCapacityAvailable > 300))
    ) {
      const getAllCreepsMemory = GetAllCreepsMemory(roomName, ["pioneer"]);
      if (
        getAllCreepsMemory.code === FunctionReturnCodes.OK && (getAllCreepsMemory.response as CreepMemory[])
          .length <
        MaxCreepsPerCreepType * 1.5
      ) {
        return FunctionReturnHelper(FunctionReturnCodes.OK, "pioneer");
      }
      return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
    }

    const getJobActionsWithCreepNeed = GetJobActionsWithCreepNeed(
      roomName,
      usePriorityJobs
    );
    if (getJobActionsWithCreepNeed.code !== FunctionReturnCodes.OK) return FunctionReturnHelper(getJobActionsWithCreepNeed.code);
  const possibleJobActionTypes: JobActionTypes[] = getJobActionsWithCreepNeed.response;

  const possibleCreepTypes: CreepTypes[] = [];
  forEach(possibleJobActionTypes, (key: JobActionTypes) => {
    switch (key) {
      case "move":
        possibleCreepTypes.push("move");
        break;
      case "transfer":
      case "withdraw":
        possibleCreepTypes.push("transferring");
        break;
      case "harvest":
      case "build":
      case "repair":
      case "dismantle":
      case "upgrade":
        possibleCreepTypes.push("work");
        break;
      case "attack":
        possibleCreepTypes.push("attack");
        break;
      case "claim":
        possibleCreepTypes.push("claim");
        break;
      case "heal":
        possibleCreepTypes.push("heal");
        break;
      default:
        break;
    }
  });

  if (possibleCreepTypes.length === 0)
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);

  if (possibleCreepTypes.includes("work"))
    return FunctionReturnHelper(FunctionReturnCodes.OK, "work");
  if (possibleCreepTypes.includes("transferring"))
    return FunctionReturnHelper(FunctionReturnCodes.OK, "transferring");
  if (possibleCreepTypes.includes("attack"))
    return FunctionReturnHelper(FunctionReturnCodes.OK, "attack");
  if (possibleCreepTypes.includes("heal"))
    return FunctionReturnHelper(FunctionReturnCodes.OK, "heal");
  if (possibleCreepTypes.includes("move"))
    return FunctionReturnHelper(FunctionReturnCodes.OK, "move");
  if (possibleCreepTypes.includes("claim"))
    return FunctionReturnHelper(FunctionReturnCodes.OK, "claim");
  return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
});

/**
 * Get unique creepName that is not yet defined in creep memory
 *
 * @param {CreepTypes} creepType - type of creep
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetUniqueName = FuncWrapper(function GetUniqueName(
  creepType: CreepTypes
): FunctionReturn {
  const getName = ()=> `${creepType}-${Math.floor(Math.random() * 100001)}`;;
  let name: string | undefined = undefined;
  do {
    name = getName();
  } while (isUndefined(Memory.creeps[name])) {
    name = getName();
  }
  return FunctionReturnHelper(FunctionReturnCodes.OK, name);
});

/**
 * Calculate cost of complete body part by part.
 *
 * @param {BodyPartConstant[]} body - body array
 * @return {number} cost of body
 *
 */
const CalcBodyCost = function CalcBodyCost(body: BodyPartConstant[]): number{
  const bodyCost = reduce(body, (sum, part) => sum + BODYPART_COST[part], 0);
  return bodyCost;
};

/**
 * Generate body array based on starting body and body iterations.
 *
 * @param {BodyPartConstant[]} body - body array
 * @return {number} HTTP response with code and data
 *
 */
export const GenerateBody = FuncWrapper(function GenerateBody(
  parts: BodyPartConstant[],
  bodyIteration: BodyPartConstant[],
  energyAvailable: number,
  maxLoopCount: number = 50
): FunctionReturn {
  let body: BodyPartConstant[] = parts;
  let i = 0;

  while (
    CalcBodyCost(body) + CalcBodyCost(bodyIteration) <=
      energyAvailable &&
    body.length + bodyIteration.length <= MAX_CREEP_SIZE &&
    i < maxLoopCount
  ) {
    body = body.concat(bodyIteration);
    i += 1;
  }

  if (body.length === parts.length) body = [];

  return FunctionReturnHelper(FunctionReturnCodes.OK, body)
});

/**
 * Return a list of body parts that will be used to spawn inputted creep type
 *
 * @param {CreepTypes} creepType - type of creep
 * @param {Room} room - Room creep going to spawn in
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const GetBodyParts = FuncWrapper(function GetBodyParts(
  creepType: CreepTypes,
  room: Room
): FunctionReturn {

  let generateBody: FunctionReturn = {code: FunctionReturnCodes.NO_CONTENT};

  switch (creepType) {
    case "attack":
      generateBody = GenerateBody([], [TOUGH, MOVE, MOVE, ATTACK], room.energyAvailable);
      break;
    case "claim":
      generateBody = GenerateBody([], [MOVE, MOVE, CLAIM], room.energyAvailable);
      break;
    case "heal":
      generateBody = GenerateBody([], [MOVE, HEAL], room.energyAvailable);
      break;
    case "move":
      generateBody = GenerateBody([], [MOVE], room.energyAvailable, 2);
      break;
    case "transferring":
      generateBody = GenerateBody([], [MOVE, CARRY, CARRY], room.energyAvailable);
      break;
    case "pioneer":
    case "work":
      generateBody = GenerateBody([], [MOVE, WORK, CARRY], room.energyAvailable);
      break;
    default:
      break;
  }

  if (generateBody.code !== FunctionReturnCodes.OK) return FunctionReturnHelper(generateBody.code);
  const body: BodyPartConstant[] = generateBody.response;

  return FunctionReturnHelper(FunctionReturnCodes.OK, {
    parts: body,
    bodyCost: CalcBodyCost(body),
  });
});

/**
 * Try to spawn creep from queue or a next creep type.
 *
 * @param {StructureSpawn} spawn - spawn structure
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const SpawnCreep = FuncWrapper(function SpawnCreep(
  spawn: StructureSpawn
): FunctionReturn {
  const roomName: string = spawn.room.name;
  let creepType: CreepTypes = "none";
  let usedQueue = false;

  if (Memory.rooms[roomName].spawnQueue.length === 0) {
    let getNextCreepType = GetNextCreepType(roomName, true);
    if (getNextCreepType.code !== FunctionReturnCodes.OK) {
      getNextCreepType = GetNextCreepType(roomName);
      if (getNextCreepType.code !== FunctionReturnCodes.OK) {
        return FunctionReturnHelper(getNextCreepType.code);
      }
    }
    creepType = getNextCreepType.response;
  } else {
    creepType = Memory.rooms[roomName].spawnQueue.shift() as CreepTypes;
    if (isUndefined(creepType))
      return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);
    usedQueue = true;
  }

  const getUniqueName = GetUniqueName(creepType);
  if (getUniqueName.code !== FunctionReturnCodes.OK)return FunctionReturnHelper(getUniqueName.code);
  const name:string = getUniqueName.response;
  const getBodyParts = GetBodyParts(creepType, spawn.room);
  if (getBodyParts.code !== FunctionReturnCodes.OK) return FunctionReturnHelper(getBodyParts.code);
  const body: {parts:BodyPartConstant[], bodyCost:number} = getBodyParts.response;

  const spawnCreep = spawn.spawnCreep(body.parts, name);
  if (spawnCreep !== OK) {
    if (usedQueue) {
      Memory.rooms[roomName].spawnQueue.splice(0, 0, creepType);
    }
    return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED, spawnCreep);
  }

  const spawnExpenses =
    global.preProcessingStats.rooms[spawn.room.name].energyExpenses.spawn;
  if (isUndefined(spawnExpenses[creepType])) spawnExpenses[creepType] = 0;
  spawnExpenses[creepType] += body.bodyCost;

  Log(
    LogTypes.Debug,
    "src/rooms/spawning:SpawnCreep",
    `spawned a creep with the type: ${creepType}`
  );
  InitializeCreepMemory(name, roomName, creepType, true);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

/**
 * Check if spawn is busy otherwise try to spawn an creep.
 *
 * @param {StructureSpawn} spawn - spawn structure
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const TryToSpawnCreep = FuncWrapper(function TryToSpawnCreep(
  spawn: StructureSpawn
): FunctionReturn {
  if (spawn.spawning)
    return FunctionReturnHelper(FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF);

  SpawnCreep(spawn);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

/**
 * Execute an spawn
 *
 * @param {StructureSpawn} str - Spawn structure
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const ExecuteSpawn = FuncWrapper(function ExecuteSpawn(
  str: StructureSpawn
): FunctionReturn {
  RepairIfDamagedStructure(str);
  TryToCreateTransferJob(str, 100, RESOURCE_ENERGY, true);

  TryToSpawnCreep(str);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
