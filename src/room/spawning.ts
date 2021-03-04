import { forEach, forOwn, isUndefined, reduce } from "lodash";
import { FuncWrapper } from "../utils/wrapper";
import { GetJobs } from "./jobs";
import { GetCreepsMemory } from "../creep/helper";
import { MaxCreepsPerCreepType } from "../utils/constants/room";
import { FunctionReturnCodes, LogTypes } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { GetStructures } from "./reading";
import { Log } from "../utils/logger";
import { InitializeCreepMemory } from "../memory/initialization";
import { GetRoom } from "./helper";

type JobActionObj = { usableCreeps: number; wantedCreeps: number };

export const GetJobActionsWithCreepNeed = FuncWrapper(
  function GetJobActionsWithCreepNeed(id: string): FunctionReturn {
    let jobs = GetJobs(id).response;

    const priorityJobs: Job[] = jobs.filter((j: Job) => j.hasPriority);
    if (priorityJobs.length > 0) {
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
  roomId: string
): FunctionReturn {
  const room: Room = GetRoom(roomId).response;
  if (room) {
    if (room.energyCapacityAvailable / 5 > room.energyAvailable) {
      return FunctionReturnHelper(FunctionReturnCodes.OK, "pioneer");
    }
  }

  const possibleJobActionTypes: JobActionTypes[] = GetJobActionsWithCreepNeed(
    roomId
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

export const GetActiveSpawns = FuncWrapper(function GetActiveSpawns(
  roomId: string
): FunctionReturn {
  const spawns: StructureSpawn[] = GetStructures(roomId, [STRUCTURE_SPAWN])
    .response;
  if (spawns.length === 0)
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);

  const activeSpawns = spawns.filter((s) => !s.spawning);
  return FunctionReturnHelper(FunctionReturnCodes.OK, activeSpawns);
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
    case "pioneer":
      generateBody([], [MOVE, WORK, CARRY]);
      break;
    case "transferring":
      generateBody([], [MOVE, CARRY, CARRY]);
      break;
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

export const SpawnCreeps = FuncWrapper(function SpawnCreeps(
  roomId: string
): FunctionReturn {
  const getSpawns = GetActiveSpawns(roomId);
  if (getSpawns.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(getSpawns.code);

  const spawns: StructureSpawn[] = getSpawns.response;
  forEach(
    spawns,
    (spawn): FunctionReturn => {
      let creepType: CreepTypes = "none";
      let usedQueue = false;
      if (Memory.rooms[roomId].spawnQueue[0]) {
        creepType = Memory.rooms[roomId].spawnQueue.shift() as CreepTypes;
        if (isUndefined(creepType))
          return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);
        usedQueue = true;
      } else {
        const getNextCreepType = GetNextCreepType(roomId);
        if (getNextCreepType.code !== FunctionReturnCodes.OK)
          return FunctionReturnHelper(getNextCreepType.code);
        creepType = getNextCreepType.response;
      }

      const name = GetUniqueName(creepType).response;
      const body = GetBodyParts(creepType, spawn.room).response;
      const spawnCreep = spawn.spawnCreep(body.parts, name);
      if (spawnCreep !== OK) {
        if (usedQueue) {
          Memory.rooms[roomId].spawnQueue.splice(0, 0, creepType);
        }
        return FunctionReturnHelper(
          FunctionReturnCodes.NOT_MODIFIED,
          spawnCreep
        );
      }

      Log(
        LogTypes.Debug,
        "src/rooms/spawning:SpawnCreep",
        `spawned a creep with the type: ${creepType}`
      );
      InitializeCreepMemory(name, roomId, creepType, true);
      return FunctionReturnHelper(FunctionReturnCodes.OK);
    }
  );
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
