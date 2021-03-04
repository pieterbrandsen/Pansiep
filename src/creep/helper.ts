import { isUndefined, forOwn } from "lodash";
import { FunctionReturnHelper } from "../utils/statusGenerator";
import { FuncWrapper } from "../utils/wrapper";
import { FunctionReturnCodes } from "../utils/constants/global";
import { GetJobById } from "../room/jobs";
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

export const ExecuteJob = FuncWrapper(function ExecuteJob(
  creep: Creep,
  creepMem: CreepMemory
): FunctionReturn {
  const job: Job = GetJobById(creepMem.jobId as Id<Job>, creepMem.commandRoom)
    .response;
  switch (job.action) {
    case "attack":
      ExecuteAttack(creep, creepMem, job);
      break;
    case "build":
      ExecuteBuild(creep, creepMem, job);
      break;
    case "claim":
      ExecuteClaim(creep, creepMem, job);
      break;
    case "dismantle":
      ExecuteDismantle(creep, creepMem, job);
      break;
    case "harvest":
      ExecuteHarvest(creep, creepMem, job);
      break;
    case "heal":
      ExecuteHeal(creep, creepMem, job);
      break;
    case "move":
      ExecuteMove(creep, creepMem, job);
      break;
    case "repair":
      ExecuteRepair(creep, creepMem, job);
      break;
    case "transfer":
      ExecuteTransfer(creep, creepMem, job);
      break;
    case "upgrade":
      ExecuteUpgrade(creep, creepMem, job);
      break;
    case "withdraw":
      ExecuteWithdraw(creep, creepMem, job);
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
  return FunctionReturnHelper<Creep>(FunctionReturnCodes.OK, creep);
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
