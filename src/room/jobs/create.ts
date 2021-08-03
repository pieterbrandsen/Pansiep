import WrapperHandler from "../../utils/wrapper";

import RoomHelper from "../helper";
import JobHandler from "./handler";

export default class CreateJobHandler {
  /**
   * Returns Harvest job id based on @param pos
   */
  public static GetHarvestJobId = WrapperHandler.FuncWrapper(
    function GetHarvestJobId(pos: RoomPosition): Id<Job> {
      const jobId: Id<Job> = `harvest-${pos.x}/${pos.y}` as Id<Job>;
      return jobId;
    }
  );

  /**
   * Creates an harvest job
   */
  public static CreateHarvestJob = WrapperHandler.FuncWrapper(
    function CreateHarvestJob(source: Source): Job {
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
      JobHandler.SetJob(job, true);
      return job;
    }
  );

  /**
   * Returns Heal job id based on @param creepName
   */
  public static GetHealJobId = WrapperHandler.FuncWrapper(function GetHealJobId(
    creepName: string
  ): Id<Job> {
    const jobId: Id<Job> = `heal-${creepName}` as Id<Job>;
    return jobId;
  });

  /**
   * Creates an heal job
   */
  public static CreateHealJob = WrapperHandler.FuncWrapper(
    function CreateHealJob(creep: Creep, stopAtMaxHealth = false): Job {
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
        stopHealingAtMaxHits: stopAtMaxHealth,
      };
      JobHandler.SetJob(job, true);
      return job;
    }
  );

  /**
   * Returns Attack job id based on @param targetId
   */
  public static GetAttackJobId = WrapperHandler.FuncWrapper(
    function GetHealJobId(targetId: string): Id<Job> {
      const jobId: Id<Job> = `attack-${targetId}` as Id<Job>;
      return jobId;
    }
  );

  /**
   * Creates an attack job
   */
  public static CreateAttackJob = WrapperHandler.FuncWrapper(
    function CreateAttackJob(
      roomName: string,
      targetId: Id<Creep | Structure>
    ): Job {
      const jobId: Id<Job> = CreateJobHandler.GetAttackJobId(targetId);
      const job: Job = {
        id: jobId,
        action: "attack",
        updateJobAtTick: Game.time + 50,
        assignedCreepsNames: [],
        maxCreeps: 2,
        assignedStructuresIds: [],
        maxStructures: 99,
        roomName,
        objId: targetId,
        hasPriority: false,
      };
      JobHandler.SetJob(job, true);
      return job;
    }
  );

  /**
   * Returns Move job id based on @param roomName
   */
  public static GetMoveJobId = WrapperHandler.FuncWrapper(function GetMoveJobId(
    roomName: string
  ): Id<Job> {
    const jobId: Id<Job> = `move-25/25-${roomName}` as Id<Job>;
    return jobId;
  });

  /**
   * Creates an move job
   */
  public static CreateMoveJob = WrapperHandler.FuncWrapper(
    function CreateMoveJob(
      roomName: string,
      pos: RoomPosition = new RoomPosition(25, 25, roomName),
      hasPriority = false
    ): Job {
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
        objId: "undefined" as Id<Structure>,
        hasPriority,
        position: pos,
      };
      JobHandler.SetJob(job, true);
      return job;
    }
  );

  /**
   * Returns Build job id based on @param pos
   */
  public static GetBuildJobId = WrapperHandler.FuncWrapper(
    function GetBuildJobId(pos: RoomPosition): Id<Job> {
      const jobId: Id<Job> = `build-${pos.x}/${pos.y}` as Id<Job>;
      return jobId;
    }
  );

  /**
   * Creates an build job
   */
  public static CreateBuildJob = WrapperHandler.FuncWrapper(
    function CreateBuildJob(
      room: Room,
      pos: RoomPosition,
      structureType: StructureConstant,
      hasPriority = false
    ): Job {
      const jobId: Id<Job> = CreateJobHandler.GetBuildJobId(pos);
      const openSpots = RoomHelper.Reader.GetAccesSpotsAroundPosition(
        room,
        pos,
        2
      );
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
        energyRequired: CONSTRUCTION_COST[structureType],
      };
      JobHandler.SetJob(job, true);
      return job;
    }
  );

  /**
   * Returns Withdraw job id based on @param action && @param pos
   */
  public static GetWithdrawJobId = WrapperHandler.FuncWrapper(
    function GetWithdrawJobId(
      action: JobWithdrawActionTypes,
      pos: RoomPosition,
      resourceType: ResourceConstant
    ): Id<Job> {
      const jobId: Id<Job> = `${action}-${pos.x}/${pos.y}-${resourceType}` as Id<Job>;
      return jobId;
    }
  );

  /**
   * Creates an withdraw job
   */
  public static CreateWithdrawJob = WrapperHandler.FuncWrapper(
    function CreateWithdrawJob(
      str: Structure,
      energyRequired: number,
      resourceType: ResourceConstant,
      action: JobWithdrawActionTypes,
      hasPriority = false
    ): Job {
      const jobId: Id<Job> = CreateJobHandler.GetWithdrawJobId(
        action,
        str.pos,
        resourceType
      );
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
      JobHandler.SetJob(job, true);
      return job;
    }
  );

  /**
   * Returns Transfer job id based on @param action && @param pos && @param resourceType
   */
  public static GetTransferJobId = WrapperHandler.FuncWrapper(
    function GetTransferJobId(
      action: JobTransferActionTypes,
      pos: RoomPosition,
      resourceType: ResourceConstant
    ): Id<Job> {
      const jobId: Id<Job> = `${action}-${pos.x}/${pos.y}-${resourceType}` as Id<Job>;
      return jobId;
    }
  );

  /**
   * Creates an transfer job
   */
  public static CreateTransferJob = WrapperHandler.FuncWrapper(
    function CreateTransferJob(
      str: Structure,
      energyRequired: number,
      resourceType: ResourceConstant,
      action: JobTransferActionTypes,
      hasPriority = false
    ): Job {
      const jobId: Id<Job> = CreateJobHandler.GetTransferJobId(
        action,
        str.pos,
        resourceType
      );
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
        energyRequired,
        resourceType,
      };
      JobHandler.SetJob(job, true);
      return job;
    }
  );

  /**
   * Returns Upgrade job id for @param room
   */
  public static GetUpgradeJobId = WrapperHandler.FuncWrapper(
    function GetUpgradeJobId(pos: RoomPosition): Id<Job> {
      const jobId: Id<Job> = `upgrade-${pos.x}/${pos.y}` as Id<Job>;
      return jobId;
    }
  );

  /**
   * Creates an upgrade job
   */
  public static CreateUpgradeJob = WrapperHandler.FuncWrapper(
    function CreateUpgradeJob(
      controller: StructureController,
      hasPriority = false
    ): Job {
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
      JobHandler.SetJob(job, true);
      return job;
    }
  );

  /**
   * Returns Repair job id for @param str
   */
  public static GetRepairJobId = WrapperHandler.FuncWrapper(
    function GetRepairJobId(str: Structure): Id<Job> {
      const jobId: Id<Job> = `repair-${str.pos.x}/${str.pos.x}-${str.structureType}` as Id<Job>;
      return jobId;
    }
  );

  /**
   * Creates an repair job
   */
  public static CreateRepairJob = WrapperHandler.FuncWrapper(
    function CreateRepairJob(str: Structure, hasPriority = false): Job {
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
      JobHandler.SetJob(job, true);
      return job;
    }
  );

  /**
   * Returns Claim job id for @param roomName
   */
  public static GetClaimJobId = WrapperHandler.FuncWrapper(
    function GetClaimJobId(roomName: string): Id<Job> {
      const jobId: Id<Job> = `claim-${roomName}` as Id<Job>;
      return jobId;
    }
  );

  /**
   * Creates an claim job
   */
  public static CreateClaimJob = WrapperHandler.FuncWrapper(
    function CreateClaimJob(
      room: Room,
      controller: StructureController,
      hasPriority = false
    ): Job {
      const jobId = CreateJobHandler.GetClaimJobId(room.name);
      const job: Job = {
        id: jobId,
        action: "claim",
        updateJobAtTick: Game.time + 500,
        assignedCreepsNames: [],
        maxCreeps: 2,
        assignedStructuresIds: [],
        maxStructures: 0,
        roomName: room.name,
        objId: controller.id,
        hasPriority,
        position: controller.pos,
      };
      JobHandler.SetJob(job, true);
      return job;
    }
  );
}
