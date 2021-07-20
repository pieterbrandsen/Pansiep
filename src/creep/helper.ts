import { isUndefined, forOwn } from "lodash";
import FuncWrapper from "../utils/wrapper";
import JobHandler from "../room/jobs/handler";
import CreepActions from "./actions/actions";

export default class CreepHelper {
  public static IsCreepDamaged = FuncWrapper(function IsCreepDamaged(
    creep: Creep
  ): boolean {
    return creep.hits < creep.hitsMax;
  });

  // public static UpdateCreepMemory = FuncWrapper(function UpdateCreepMemory(
  //   name: string,
  //   mem: CreepMemory
  // ) {
  //   Memory.creeps[name] = mem;
  //   return FunctionReturnHelper(FunctionReturnCodes.OK);
  // });

  public static ExecuteJob = FuncWrapper(function ExecuteJob(
    creep: Creep,
    creepMem: CreepMemory
  ): void {
    const job = JobHandler.GetJob(
      creepMem.jobId as Id<Job>,
      creepMem.commandRoom
    );
    if (job === null) {
      const mem = creepMem;
      delete mem.jobId;
      return;
    }

    switch (job.action) {
      case "attack":
        CreepActions.Attack(creep, job);
        break;
      case "build":
        CreepActions.Build(creep, job);
        break;
      case "claim":
        CreepActions.Claim(creep, job);
        break;
      case "dismantle":
        CreepActions.Dismantle(creep, job);
        break;
      case "harvest":
        CreepActions.Harvest(creep, job);
        break;
      case "heal":
        CreepActions.Heal(creep, job);
        break;
      case "move":
        CreepActions.Move(creep, job);
        break;
      case "repair":
        CreepActions.Repair(creep, job);
        break;
      case "transfer":
      case "transferSource":
        CreepActions.Transfer(creep, job);
        break;
      case "upgrade":
        CreepActions.Upgrade(creep, job);
        break;
      case "withdraw":
      case "withdrawController":
        CreepActions.Withdraw(creep, job);
        break;
      default:
        break;
    }
  });

  public static GetCreep = FuncWrapper(function GetCreep(id: string): Creep {
    const creep = Game.creeps[id];
    return creep;
  });

  public static GetCreepMemory = FuncWrapper(function GetCreepMemory(
    creepName: string
  ): CreepMemory {
    const creepMemory = Memory.creeps[creepName];
    return creepMemory;
  });

  public static GetAllCreepsMemory = FuncWrapper(function GetAllCreepMemory(
    id: string,
    filterOnType?: CreepTypes[]
  ): CreepMemory[] {
    const creepsMemory: CreepMemory[] = [];

    forOwn(Memory.creeps, (mem: CreepMemory) => {
      if (
        isUndefined(mem.isNotSeenSince) &&
        mem.commandRoom === id &&
        (filterOnType ? filterOnType.includes(mem.type) : true)
      )
        creepsMemory.push(mem);
    });

    return creepsMemory;
  });

  public static GetCachedCreepIds = FuncWrapper(function GetAllCreepIds(
    id: string
  ): string[] {
    const creepsCache: CreepCache[] = Memory.cache.creeps.data[id];
    const creepIds = creepsCache.map((c) => c.id);
    return creepIds;
  });

  public static GetType = FuncWrapper(function GetType(
    creep: Creep
  ): CreepTypes {
    if (creep.getActiveBodyparts(CLAIM) > 0) {
      return "claim";
    }
    if (creep.getActiveBodyparts(HEAL) > 0) {
      return "heal";
    }
    if (
      creep.getActiveBodyparts(ATTACK) +
        creep.getActiveBodyparts(RANGED_ATTACK) >
      0
    ) {
      return "attack";
    }
    if (creep.getActiveBodyparts(WORK) > 0) {
      return "work";
    }
    if (creep.getActiveBodyparts(CARRY) > 0) {
      return "transferring";
    }
    if (creep.getActiveBodyparts(MOVE) > 0) {
      return "move";
    }

    return "none";
  });
}
