import { forEach, forOwn, reduce, isUndefined } from "lodash";
import { GetCreepsMemory } from "../../creep/helper";
import { InitializeCreepMemory } from "../../memory/initialization";
import { GetRoom, GetRoomMemoryUsingName } from "../../room/helper";
import { GetAllJobs } from "../../room/jobs/handler";
import { FunctionReturnCodes, LogTypes } from "../../utils/constants/global";
import { MaxCreepsPerCreepType } from "../../utils/constants/room";
import { Log } from "../../utils/logger";
import { FunctionReturnHelper } from "../../utils/statusGenerator";
import { FuncWrapper } from "../../utils/wrapper";
import { TryToCreateRepairJob, TryToCreateTransferJob } from "./helper";

type JobActionObj = { usableCreeps: number; wantedCreeps: number };
export const GetJobActionsWithCreepNeed = FuncWrapper(
  function GetJobActionsWithCreepNeed(
    id: string,
    usePriorityJobs
  ): FunctionReturn {
    let jobs = GetAllJobs(id).response;

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
    forOwn(jobActionTypesObj, (value: JobActionObj, key: string) => {
      switch (key) {
        case "move":
          jobActionTypesObj[key].usableCreeps = (GetCreepsMemory(id, ["move"])
            .response as CreepMemory[]).length;
          break;
        case "transfer":
        case "withdraw":
          jobActionTypesObj[key].usableCreeps = (GetCreepsMemory(id, [
            "transferring",
          ]).response as CreepMemory[]).length;
          break;
        case "harvest":
        case "build":
        case "repair":
        case "dismantle":
        case "upgrade":
          jobActionTypesObj[key].usableCreeps = (GetCreepsMemory(id, ["work"])
            .response as CreepMemory[]).length;
          break;
        case "attack":
          jobActionTypesObj[key].usableCreeps = (GetCreepsMemory(id, ["attack"])
            .response as CreepMemory[]).length;
          break;
        case "claim":
          jobActionTypesObj[key].usableCreeps = (GetCreepsMemory(id, ["claim"])
            .response as CreepMemory[]).length;
          break;
        case "heal":
          jobActionTypesObj[key].usableCreeps = (GetCreepsMemory(id, ["heal"])
            .response as CreepMemory[]).length;
          break;
        default:
          break;
      }

      const jobAction: JobActionObj = jobActionTypesObj[key];
      if (
        jobAction.usableCreeps < MaxCreepsPerCreepType &&
        jobAction.usableCreeps < jobAction.wantedCreeps
      ) {
        jobActionTypes.push(key as JobActionTypes);
      }
    });

    return FunctionReturnHelper(FunctionReturnCodes.OK, jobActionTypes);
  }
);

export const GetNextCreepType = FuncWrapper(function GetNextCreepType(
  roomId: string,
  usePriorityJobs = false
): FunctionReturn {
  const room: Room = GetRoom(roomId).response;
  if (room) {
    if (
      room.energyCapacityAvailable <= 300 ||
      (room.energyCapacityAvailable / 4 > room.energyAvailable &&
        room.energyCapacityAvailable > 300)
    ) {
      if (
        (GetCreepsMemory(roomId, ["pioneer"]).response as CreepMemory[])
          .length <
        MaxCreepsPerCreepType * 1.5
      )
        return FunctionReturnHelper(FunctionReturnCodes.OK, "pioneer");
      return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
    }
  }

  const possibleJobActionTypes: JobActionTypes[] = GetJobActionsWithCreepNeed(
    roomId,
    usePriorityJobs
  ).response;

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

export const GetUniqueName = FuncWrapper(function GetUniqueName(
  creepType: CreepTypes
): FunctionReturn {
  const name = `${creepType}-${Math.floor(Math.random() * 10001)}`;
  return FunctionReturnHelper(FunctionReturnCodes.OK, name);
});

export const GetBodyParts = FuncWrapper(function GetBodyParts(
  creepType: CreepTypes,
  room: Room
): FunctionReturn {
  // Get current body cost
  const calcBodyCost = (body: BodyPartConstant[]) => {
    return reduce(body, (sum, part) => sum + BODYPART_COST[part], 0);
  };
  let body: BodyPartConstant[] = [];

  const generateBody = (
    parts: BodyPartConstant[],
    bodyIteration: BodyPartConstant[],
    maxLoopCount = 50
  ) => {
    body = parts;
    let i = 0;

    while (
      calcBodyCost(body) + calcBodyCost(bodyIteration) <=
        room.energyAvailable &&
      body.length + bodyIteration.length <= MAX_CREEP_SIZE &&
      i < maxLoopCount
    ) {
      body = body.concat(bodyIteration);
      i += 1;
    }

    if (body.length === parts.length) {
      body = [];
    }
  };

  switch (creepType) {
    case "attack":
      generateBody([], [TOUGH, MOVE, MOVE, ATTACK]);
      break;
    case "claim":
      generateBody([], [MOVE, MOVE, CLAIM]);
      break;
    case "heal":
      generateBody([], [MOVE, HEAL]);
      break;
    case "move":
      generateBody([], [MOVE], 2);
      break;
    case "transferring":
      generateBody([], [MOVE, CARRY, CARRY]);
      break;
    case "pioneer":
    case "work":
      generateBody([], [MOVE, WORK, CARRY]);
      break;
    default:
      break;
  }

  return FunctionReturnHelper(FunctionReturnCodes.OK, {
    parts: body,
    bodyCost: calcBodyCost(body),
  });
});

export const SpawnCreep = FuncWrapper(function SpawnCreep(
  spawn: StructureSpawn
): FunctionReturn {
  const roomId: string = spawn.room.name;
  let creepType: CreepTypes = "none";
  let usedQueue = false;

  if (Memory.rooms[roomId].spawnQueue.length === 0) {
    let getNextCreepType = GetNextCreepType(roomId, true);
    if (getNextCreepType.code !== FunctionReturnCodes.OK) {
      getNextCreepType = GetNextCreepType(roomId);
      if (getNextCreepType.code !== FunctionReturnCodes.OK) {
        return FunctionReturnHelper(getNextCreepType.code);
      }
    }
    creepType = getNextCreepType.response;
  } else {
    creepType = Memory.rooms[roomId].spawnQueue.shift() as CreepTypes;
    if (isUndefined(creepType))
      return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);
    usedQueue = true;
  }

  const name = GetUniqueName(creepType).response;
  const body = GetBodyParts(creepType, spawn.room).response;
  const spawnCreep = spawn.spawnCreep(body.parts, name);
  if (spawnCreep !== OK) {
    if (usedQueue) {
      Memory.rooms[roomId].spawnQueue.splice(0, 0, creepType);
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
  InitializeCreepMemory(name, roomId, creepType, true);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const TryToSpawnCreep = FuncWrapper(function TryToSpawnCreep(
  spawn: StructureSpawn
): FunctionReturn {
  if (spawn.spawning)
    return FunctionReturnHelper(FunctionReturnCodes.TARGET_IS_ON_DELAY_OR_OFF);

  SpawnCreep(spawn);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const ExecuteSpawn = FuncWrapper(function ExecuteSpawn(
  str: StructureSpawn
): FunctionReturn {
  TryToCreateRepairJob(str);
  TryToCreateTransferJob(str, 100, RESOURCE_ENERGY, true);

  TryToSpawnCreep(str);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
