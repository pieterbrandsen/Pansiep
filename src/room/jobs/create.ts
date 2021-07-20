import CreepHelper from "../../creep/helper";
import FuncWrapper from "../../utils/wrapper";
import RoomHelper from "../helper";
import JobHandler from "./handler";

export default class CreateJobHandler {
    /**
   * Returns Harvest job id based on @param pos
   */
     public static GetHarvestJobId = FuncWrapper(function GetHarvestJobId(
      pos: RoomPosition
    ): Id<Job> {
      const jobId: Id<Job> = `harvest-${pos.x}/${pos.y}` as Id<Job>;
      return jobId;
    });

  /**
   * Creates an harvest job
   */
  public static CreateHarvestJob = FuncWrapper(function CreateHarvestJob(
    source: Source
  ): boolean {
    const jobId = CreateJobHandler.GetHarvestJobId(source.pos);
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
   * Returns Heal job id based on @param creepName
   */
     public static GetHealJobId = FuncWrapper(function GetHealJobId(
      creepName: string
    ): Id<Job> {
      const jobId: Id<Job> = `heal-${creepName}` as Id<Job>;
      return jobId;
    });

  /**
   * Creates an heal job
   */
  public static CreateHealJob = FuncWrapper(function CreateHealJob(
    creep: Creep
  ): boolean {
    const jobId: Id<Job> = CreateJobHandler.GetHealJobId(creep.name);
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
   * Returns Move job id based on @param roomName
   */
     public static GetMoveJobId = FuncWrapper(function GetMoveJobId(
      roomName: string
    ): Id<Job> {
      const jobId: Id<Job> = `move-25/25-${roomName}` as Id<Job>;
      return jobId;
    });

  /**
   * Creates an move job
   */
  public static CreateMoveJob = FuncWrapper(function CreateMoveJob(
    roomName: string,
    pos: RoomPosition = new RoomPosition(25, 25, roomName)
  ): boolean {
    const jobId = CreateJobHandler.GetMoveJobId(roomName);
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
   * Returns Build job id based on @param structureType && @param pos
   */
   public static GetBuildJobId = FuncWrapper(function GetBuildJobId(
    structureType: StructureConstant, pos: RoomPosition
  ): Id<Job> {
    const jobId: Id<Job> =  `build-${pos.x}/${pos.y}-${structureType}` as Id<Job>;
    return jobId;
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
    const jobId: Id<Job> = CreateJobHandler.GetBuildJobId(structureType, pos);
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
   * Returns Withdraw job id based on @param action && @param pos && @param structureType 
   */
     public static GetWithdrawJobId = FuncWrapper(function GetWithdrawJobId(
      action: JobActionTypes, pos: RoomPosition, structureType: StructureConstant
    ): Id<Job> {
      const jobId: Id<Job> = `${action}-${pos.x}/${pos.y}-${structureType}` as Id<Job>;
      return jobId;
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
    const jobId: Id<Job> = CreateJobHandler.GetWithdrawJobId(action, str.pos, str.structureType);
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
   * Returns Transfer job id based on @param action && @param pos && @param structureType 
   */
   public static GetTransferJobId = FuncWrapper(function GetTransferJobId(
    action: JobActionTypes, pos: RoomPosition, structureType: StructureConstant
    ): Id<Job> {
      const jobId: Id<Job> = `${action}-${pos.x}/${pos.y}-${structureType}` as Id<Job>;
      return jobId;
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
    const jobId: Id<Job> = CreateJobHandler.GetTransferJobId(action, str.pos, str.structureType);
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
   * Returns Upgrade job id for @param room
   */
   public static GetUpgradeJobId = FuncWrapper(function GetUpgradeJobId(
    pos: RoomPosition
  ): Id<Job> {
    const jobId: Id<Job> = `upgrade-${pos.x}/${pos.y}` as Id<Job>;
    return jobId;
  });

  /**
   * Creates an upgrade job
   */
  public static CreateUpgradeJob = FuncWrapper(function CreateUpgradeJob(
    controller: StructureController,
    hasPriority = false
  ): boolean {
    const { pos } = controller;
    const jobId: Id<Job> = CreateJobHandler.GetUpgradeJobId(pos);
    const openSpots = RoomHelper.Reader.GetAccesSpotsAroundPosition(
      controller.room,
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
      roomName: controller.room.name,
      objId: controller.id,
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
