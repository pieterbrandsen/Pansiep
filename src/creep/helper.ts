import { isUndefined, forOwn } from "lodash";
import { FunctionReturnHelper } from "../utils/functionStatusGenerator";
import { FuncWrapper } from "../utils/wrapper";
import { FunctionReturnCodes } from "../utils/constants/global";
import { GetJobById } from "../room/jobs/handler";
import { ExecuteAttack } from "./actions/attack";
import { ExecuteBuild } from "./actions/build";
import { ExecuteClaim } from "./actions/claim";
import { ExecuteDismantle } from "./actions/dismantle";
import { ExecuteHarvest } from "./actions/harvest";
import { ExecuteHeal } from "./actions/heal";
import { ExecuteMove } from "./actions/move";
import { ExecuteRepair } from "./actions/repair";
import { ExecuteTransfer } from "./actions/transfer";
import { ExecuteUpgrade } from "./actions/upgrade";
import { ExecuteWithdraw } from "./actions/withdraw";
import { CreateHealJob } from "../room/jobs/create";

export const IsCreepDamaged = FuncWrapper(function IsCreepDamaged(
  creep: Creep
): FunctionReturn {
  return FunctionReturnHelper(
    FunctionReturnCodes.OK,
    creep.hits < creep.hitsMax
  );
});

export const TryToCreateHealJob = FuncWrapper(function TryToCreateHealJob(
  creep: Creep
): FunctionReturn {
  if (
    IsCreepDamaged(creep).response &&
    GetJobById(`heal-${creep.name}` as Id<Job>, creep.room.name).code ===
      FunctionReturnCodes.NOT_FOUND
  ) {
    CreateHealJob(creep);
    return FunctionReturnHelper(FunctionReturnCodes.CREATED);
  }
  return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);
});

export const UpdateCreepMemory = FuncWrapper(function UpdateCreepMemory(
  name: string,
  mem: CreepMemory
) {
  Memory.creeps[name] = mem;
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const ExecuteJob = FuncWrapper(function ExecuteJob(
  creep: Creep,
  creepMem: CreepMemory
): FunctionReturn {
  const getJobById = GetJobById(
    creepMem.jobId as Id<Job>,
    creepMem.commandRoom
  );
  if (getJobById.code === FunctionReturnCodes.NOT_FOUND) {
    const mem = creepMem;
    delete mem.jobId;
    UpdateCreepMemory(creep.name, mem);
    return FunctionReturnHelper(getJobById.code);
  }

  const job = getJobById.response;
  switch (job.action) {
    case "attack":
      ExecuteAttack(creep, job);
      break;
    case "build":
      ExecuteBuild(creep, job);
      break;
    case "claim":
      ExecuteClaim(creep, job);
      break;
    case "dismantle":
      ExecuteDismantle(creep, job);
      break;
    case "harvest":
      ExecuteHarvest(creep, job);
      break;
    case "heal":
      ExecuteHeal(creep, job);
      break;
    case "move":
      ExecuteMove(creep, job);
      break;
    case "repair":
      ExecuteRepair(creep, job);
      break;
    case "transfer":
    case "transferSource":
      ExecuteTransfer(creep, job);
      break;
    case "upgrade":
      ExecuteUpgrade(creep, job);
      break;
    case "withdraw":
    case "withdrawController":
      ExecuteWithdraw(creep, job);
      break;
    default:
      break;
  }

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

export const GetCreep = FuncWrapper(function GetCreep(
  id: string
): FunctionReturn {
  const creep: Creep | undefined = Game.creeps[id];
  if (isUndefined(creep))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper(FunctionReturnCodes.OK, creep);
});

export const GetCreepMemory = FuncWrapper(function GetCreepMemory(
  name: string
): FunctionReturn {
  const creepMem: CreepMemory | undefined = Memory.creeps[name];
  if (isUndefined(creepMem))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper(FunctionReturnCodes.OK, creepMem);
});

export const GetCreepsMemory = FuncWrapper(function GetAllCreepMemory(
  id: string,
  filterOnType?: CreepTypes[]
): FunctionReturn {
  const creepsMemory: CreepMemory[] = [];

  forOwn(Memory.creeps, (mem: CreepMemory) => {
    if (
      isUndefined(mem.isNotSeenSince) &&
      mem.commandRoom === id &&
      (filterOnType ? filterOnType.includes(mem.type) : true)
    )
      creepsMemory.push(mem);
  });

  return FunctionReturnHelper(FunctionReturnCodes.OK, creepsMemory);
});

export const GetCachedCreepIds = FuncWrapper(function GetAllCreepIds(
  id: string
): FunctionReturn {
  const creepsCache: CreepCache[] | undefined = Memory.cache.creeps.data[id];
  if (isUndefined(creepsCache))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  const creepIds = creepsCache.map((c) => c.id);
  return FunctionReturnHelper(FunctionReturnCodes.OK, creepIds);
});

export const GetType = FuncWrapper(function GetType(
  creep: Creep
): FunctionReturn {
  if (creep.getActiveBodyparts(CLAIM) > 0) {
    return FunctionReturnHelper(FunctionReturnCodes.OK, "claim");
  }
  if (creep.getActiveBodyparts(HEAL) > 0) {
    return FunctionReturnHelper(FunctionReturnCodes.OK, "heal");
  }
  if (
    creep.getActiveBodyparts(ATTACK) + creep.getActiveBodyparts(RANGED_ATTACK) >
    0
  ) {
    return FunctionReturnHelper(FunctionReturnCodes.OK, "attack");
  }
  if (creep.getActiveBodyparts(WORK) > 0) {
    return FunctionReturnHelper(FunctionReturnCodes.OK, "work");
  }
  if (creep.getActiveBodyparts(CARRY) > 0) {
    return FunctionReturnHelper(FunctionReturnCodes.OK, "transferring");
  }
  if (creep.getActiveBodyparts(MOVE) > 0) {
    return FunctionReturnHelper(FunctionReturnCodes.OK, "move");
  }

  return FunctionReturnHelper(FunctionReturnCodes.OK, "none");
});
