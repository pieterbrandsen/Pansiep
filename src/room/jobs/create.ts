import CreepHelper from "../../creep/helper";
import FuncWrapper from "../../utils/wrapper";
import RoomHelper from "../helper";
import JobHandler from "./handler";

export default class CreateJobHandler {
  /**
   * Creates an harvest job
   */
  public static CreateHarvestJob = FuncWrapper(function CreateHarvestJob(
    jobId: Id<Job>,
    source: Source
  ): boolean {
    const openSpots = RoomHelper.Reader.GetAccesSpotsAroundPosition(
      source.room,
      source.pos,
      1
    );
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
    JobHandler.AddJob(job);
    return true;
  });

  /**
   * Creates an heal job
   */
  public static CreateHealJob = FuncWrapper(function CreateHealJob(
    creep: Creep
  ): boolean {
    const jobId: Id<Job> = `heal-${creep.name}` as Id<Job>;
    const creepMemory = CreepHelper.GetCreepMemory(creep.name);
    if (JobHandler.GetJob(jobId, creepMemory.commandRoom) !== null) return true;

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
    JobHandler.AddJob(job);
    return true;
  });

  /**
   * Creates an move job
   */
  public static CreateMoveJob = FuncWrapper(function CreateMoveJob(
    jobId: Id<Job>,
    roomName: string,
    pos: RoomPosition = new RoomPosition(25, 25, roomName)
  ): boolean {
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
    JobHandler.AddJob(job);
    return true;
  });

  /**
   * Creates an build job
   */
  public static CreateBuildJob = FuncWrapper(function CreateBuildJob(
    room: Room,
    pos: RoomPosition,
    structureType: StructureConstant,
    hasPriority = false
  ): boolean {
    const jobId: Id<Job> = `build-${pos.x}/${pos.y}-${structureType}` as Id<Job>;
    const openSpots = RoomHelper.Reader.GetAccesSpotsAroundPosition(
      room,
      pos,
      2
    );
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
    JobHandler.AddJob(job);
    return true;
  });

  /**
   * Creates an withdraw job
   */
  public static CreateWithdrawJob = FuncWrapper(function CreateWithdrawJob(
    str: Structure,
    energyRequired: number,
    resourceType: ResourceConstant,
    action: JobActionTypes = "withdraw",
    hasPriority = false
  ): boolean {
    const jobId: Id<Job> = `${action}-${str.pos.x}/${str.pos.y}-${str.structureType}` as Id<Job>;
    const openSpots = RoomHelper.Reader.GetAccesSpotsAroundPosition(
      str.room,
      str.pos,
      1
    );
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
    JobHandler.AddJob(job);
    return true;
  });

  /**
   * Creates an transfer job
   */
  public static CreateTransferJob = FuncWrapper(function CreateTransferJob(
    str: Structure,
    energyRequired: number,
    resourceType: ResourceConstant,
    hasPriority = false,
    action: JobActionTypes = "transfer"
  ): boolean {
    const jobId: Id<Job> = `${action}-${str.pos.x}/${str.pos.y}-${str.structureType}` as Id<Job>;
    const openSpots = RoomHelper.Reader.GetAccesSpotsAroundPosition(
      str.room,
      str.pos,
      1
    );
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
    JobHandler.AddJob(job);
    return true;
  });

  /**
   * Creates an upgrade job
   */
  public static CreateUpgradeJob = FuncWrapper(function CreateUpgradeJob(
    room: Room,
    hasPriority = false
  ): boolean {
    if (room.controller === undefined) {
      return false;
    }

    const { pos } = room.controller;
    const jobId: Id<Job> = `upgrade-${pos.x}/${pos.y}` as Id<Job>;
    const openSpots = RoomHelper.Reader.GetAccesSpotsAroundPosition(
      room,
      pos,
      2
    );
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
    JobHandler.AddJob(job);
    return true;
  });

  /**
   * Returns Repair job id for @param str
   */
  public static GetRepairJobId = FuncWrapper(function GetRepairJobId(
    str: Structure
  ): Id<Job> {
    const jobId: Id<Job> = `repair-${str.pos.x}/${str.pos.x}-${str.structureType}` as Id<Job>;
    return jobId;
  });

  /**
   * Creates an repair job
   */
  public static CreateRepairJob = FuncWrapper(function CreateRepairJob(
    str: Structure,
    hasPriority = false
  ): void {
    const jobId = CreateJobHandler.GetRepairJobId(str);
    const openSpots = RoomHelper.Reader.GetAccesSpotsAroundPosition(
      str.room,
      str.pos,
      2
    );
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
    JobHandler.AddJob(job);
  });
}
