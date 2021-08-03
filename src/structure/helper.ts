import RoomHelper from "../room/helper";
import JobHandler from "../room/jobs/handler";
import StructureConstants from "../utils/constants/structure";
import UtilsHelper from "../utils/helper";
import WrapperHandler from "../utils/wrapper";
import StructureActions from "./types/actionsGroup";

type OverFlowObject = { hasOverflow: boolean; overflowAmount: number };

export default class StructureHelper {
  /**
   * Return structure object
   */
  public static GetStructure = WrapperHandler.FuncWrapper(function GetStructure(
    id: Id<Structure>
  ): Structure {
    return UtilsHelper.GetObject(id) as Structure;
  });

  /**
   * Send in an structure and return if the hit points is lower than the maximum.
   */
  public static IsStructureDamaged = WrapperHandler.FuncWrapper(
    function IsStructureDamaged(str: Structure): boolean {
      return str.hits < str.hitsMax;
    }
  );

  /**
   * Return structure capacity.
   */
  public static GetCapacity = WrapperHandler.FuncWrapper(function GetCapacity(
    str: Structure,
    resourceType: ResourceConstant
  ): number {
    const capacity = (str as StructureStorage).store.getCapacity(resourceType);
    return capacity;
  });

  /**
   * Return structure free capacity.
   */
  public static GetFreeCapacity = WrapperHandler.FuncWrapper(
    function GetFreeCapacity(
      str: Structure,
      resourceType: ResourceConstant
    ): number {
      const freeCapacity = (str as StructureStorage).store.getFreeCapacity(
        resourceType
      );
      return freeCapacity;
    }
  );

  /**
   * Return structure used capacity.
   */
  public static GetUsedCapacity = WrapperHandler.FuncWrapper(
    function GetUsedCapacity(
      str: Structure,
      resourceType: ResourceConstant
    ): number {
      const usedCapacity = (str as StructureStorage).store.getUsedCapacity(
        resourceType
      );
      return usedCapacity;
    }
  );

  /**
   * Return if the used capacity is higher inputted {requiredPercentageFull}.
   */
  public static IsStructureFullEnough = WrapperHandler.FuncWrapper(
    function IsStructureFullEnough(
      str: Structure,
      requiredPercentageFull: number,
      resourceType: ResourceConstant
    ): OverFlowObject {
      const resourceCount: number = StructureHelper.GetUsedCapacity(
        str,
        resourceType
      );
      const capacity: number = StructureHelper.GetCapacity(str, resourceType);
      const percentageFull = (resourceCount / capacity) * 100;
      const overflowAmount =Math.abs(
        (percentageFull - requiredPercentageFull) * (capacity / 100));
      return {
        hasOverflow:
          percentageFull < 100
            ? percentageFull > requiredPercentageFull
            : false,
        overflowAmount,
      };
    }
  );

  // /**
  //  * Update structure memory with inputted memory object. If no memory object is present, a new one will be created.
  //  */
  // public static UpdateStructureMemory = WrapperHandler.FuncWrapper(function UpdateStructureMemory(
  //   id: Id<Structure>,
  //   mem: StructureMemory
  // ) {
  //   Memory.structures[id] = mem;
  //   return FunctionReturnHelper(FunctionReturnCodes.OK);
  // });

  /**
   * Get copy of the structure memory your trying to find. If it is not found it returns an NotFound code.
   */
  public static GetStructureMemory = WrapperHandler.FuncWrapper(
    function GetStructureMemory(id: Id<Structure>): StructureMemory {
      const strMem: StructureMemory = Memory.structures[id];
      return strMem;
    }
  );

  /**
   * Get copy of all the structure memory id's of the roomName. If it is not found it returns an NotFound code.
   */
  public static GetAllStructureIds = WrapperHandler.FuncWrapper(
    function GetAllStructureIds(roomName: string): Id<Structure>[] {
      const structureIds: string[] = Memory.cache.structures.data[roomName]
        ? Memory.cache.structures.data[roomName].map((c) => c.id)
        : [];

      return structureIds as Id<Structure>[];
    }
  );

  /**
   * Build a structure in room and create build job.
   */
  public static BuildStructure = WrapperHandler.FuncWrapper(
    function BuildStructure(
      room: Room,
      pos: RoomPosition,
      structureType: StructureConstant,
      hasPriority = false
    ): boolean {
      switch (room.createConstructionSite(pos, structureType)) {
        case OK:
          JobHandler.CreateJob.CreateBuildJob(
            room,
            pos,
            structureType,
            hasPriority
          );
          return true;
        default:
          break;
      }
      return false;
    }
  );

  /**
   * Run the structure, this function will run the correct structureType.
   */
  public static ExecuteStructure = WrapperHandler.FuncWrapper(
    function ExecuteStructure(str: Structure): void {
      switch (str.structureType) {
        case STRUCTURE_CONTAINER:
          StructureActions.Container(str as StructureContainer);
          break;
        case STRUCTURE_CONTROLLER:
          StructureActions.Controller(str as StructureController);
          break;
        case STRUCTURE_EXTENSION:
          StructureActions.Extension(str as StructureExtension);
          break;
        case STRUCTURE_FACTORY:
          StructureActions.Factory(str as StructureFactory);
          break;
        case STRUCTURE_LAB:
          StructureActions.Lab(str as StructureLab);
          break;
        case STRUCTURE_LINK:
          StructureActions.Link(str as StructureLink);
          break;
        case STRUCTURE_NUKER:
          StructureActions.Nuker(str as StructureNuker);
          break;
        case STRUCTURE_OBSERVER:
          StructureActions.Observer(str as StructureObserver);
          break;
        case STRUCTURE_SPAWN:
          StructureActions.SpawnHandler.ExecuteSpawn(str as StructureSpawn);
          break;
        case STRUCTURE_STORAGE:
          StructureActions.Storage(str as StructureStorage);
          break;
        case STRUCTURE_TERMINAL:
          StructureActions.Terminal(str as StructureTerminal);
          break;
        case STRUCTURE_TOWER:
          StructureActions.TowerHandler.ExecuteTower(str as StructureTower);
          break;
        case STRUCTURE_ROAD:
          StructureActions.Road(str as StructureRoad);
          break;
        default:
          break;
      }
    }
  );

  /**
   * Control if an container need to be filled/withdraw from
   */
  public static ControlStorageOfContainer = WrapperHandler.FuncWrapper(
    function ControlStorageOfContainer(str: StructureContainer): void {
      const sourcesInRange = RoomHelper.Reader.GetSourcesInRange(
        str.pos,
        2,
        str.room
      );

      if (
        str.room.controller &&
        str.pos.inRangeTo(
          str.room.controller,
          StructureConstants.ControllerEnergyStructureRange
        )
      ) {
        StructureHelper.KeepStructureEmptyEnough(
          str,
          0,
          RESOURCE_ENERGY,
          "withdrawController"
        );
        StructureHelper.KeepStructureFullEnough(str, 100, RESOURCE_ENERGY);
      } else if (sourcesInRange.length > 0) {
        StructureHelper.KeepStructureEmptyEnough(str, 0, RESOURCE_ENERGY);
        StructureHelper.KeepStructureFullEnough(
          str,
          100,
          RESOURCE_ENERGY,
          "transferSource"
        );
      } else {
        StructureHelper.KeepStructureEmptyEnough(str, 50, RESOURCE_ENERGY);
      }
    }
  );

  /**
   * Control if an link need to be filled/withdraw from
   */
  public static ControlStorageOfLink = WrapperHandler.FuncWrapper(
    function ControlStorageOfLink(str: StructureLink): void {
      const sourcesInRange = RoomHelper.Reader.GetSourcesInRange(
        str.pos,
        2,
        str.room
      );
      if (
        str.room.controller &&
        str.pos.inRangeTo(
          str.room.controller,
          StructureConstants.ControllerEnergyStructureRange
        )
      ) {
        StructureHelper.KeepStructureEmptyEnough(
          str,
          0,
          RESOURCE_ENERGY,
          "withdrawController"
        );
      } else if (sourcesInRange.length > 0) {
        StructureHelper.KeepStructureEmptyEnough(str, 0, RESOURCE_ENERGY);
        StructureHelper.KeepStructureFullEnough(
          str,
          100,
          RESOURCE_ENERGY,
          "transferSource"
        );
      } else {
        StructureHelper.KeepStructureEmptyEnough(str, 100, RESOURCE_ENERGY);
      }
    }
  );

  /**
   * Control if the storage need to be filled/withdraw from
   */
  public static ControlStorageOfStorage = WrapperHandler.FuncWrapper(
    function ControlStorageOfStorage(str: StructureStorage): void {
      StructureHelper.KeepStructureEmptyEnough(str, 50, RESOURCE_ENERGY);
      StructureHelper.KeepStructureFullEnough(str, 20, RESOURCE_ENERGY);
    }
  );

  /**
   * Control if the terminal need to be filled/withdraw from
   */
  public static ControlStorageOfTerminal = WrapperHandler.FuncWrapper(
    function ControlStorageOfTerminal(str: StructureTerminal): void {
      StructureHelper.KeepStructureEmptyEnough(str, 35, RESOURCE_ENERGY);
      StructureHelper.KeepStructureFullEnough(
        str,
        20,
        RESOURCE_ENERGY,
        "transfer",
        true
      );
    }
  );

  /**
   * Keep structure resource under @param requiredPercentageFull
   */
  public static KeepStructureFullEnough = WrapperHandler.FuncWrapper(
    function KeepStructureFullEnough(
      str: Structure,
      requiredPercentageFull: number,
      resourceType: ResourceConstant,
      jobType: JobTransferActionTypes = "transfer",
      hasPriority = false
    ): void {
      const isStructureFullEnough = StructureHelper.IsStructureFullEnough(
        str,
        requiredPercentageFull,
        resourceType
      );
      if (
        !isStructureFullEnough.hasOverflow &&
        JobHandler.GetJob(
          JobHandler.CreateJob.GetTransferJobId(jobType, str.pos, resourceType),
          str.room.name
        ) === null
      ) {
        JobHandler.CreateJob.CreateTransferJob(
          str,
          isStructureFullEnough.overflowAmount,
          RESOURCE_ENERGY,
          jobType,
          hasPriority
        );
      }
    }
  );

  /**
   * Keep structure resource under @param requiredPercentageEmpty
   */
  public static KeepStructureEmptyEnough = WrapperHandler.FuncWrapper(
    function KeepStructureEmptyEnough(
      str: Structure,
      requiredPercentageEmpty: number,
      resourceType: ResourceConstant,
      jobType: JobWithdrawActionTypes = "withdraw",
      hasPriority = false
    ): void {
      const isStructureFullEnough = StructureHelper.IsStructureFullEnough(
        str,
        requiredPercentageEmpty,
        resourceType
      );
      if (
        isStructureFullEnough.hasOverflow &&
        JobHandler.GetJob(
          JobHandler.CreateJob.GetWithdrawJobId(jobType, str.pos, resourceType),
          str.room.name
        ) === null
      ) {
        JobHandler.CreateJob.CreateWithdrawJob(
          str,
          isStructureFullEnough.overflowAmount,
          RESOURCE_ENERGY,
          jobType,
          hasPriority
        );
      }
    }
  );

  /**
   * Control if an upgrade job need to be created or deleted for the controller
   */
  public static ControlUpgradingOfController = WrapperHandler.FuncWrapper(
    function ControlUpgradingOfController(
      controller: StructureController
    ): void {
      const spendJobs = JobHandler.GetAllJobs(controller.room.name, [
        "build",
        "dismantle",
      ]);

      const energyLeftToSpend = spendJobs.reduce<number>((acc, job) => {
        // eslint-disable-next-line no-param-reassign
        acc += job.energyRequired ? job.energyRequired : 0;
        return acc;
      }, 0);

      const jobId = JobHandler.CreateJob.GetUpgradeJobId(controller.pos);
      const job = JobHandler.GetJob(jobId, controller.room.name);

      if (controller.ticksToDowngrade < 10 * 1000) {
        if (job && job.hasPriority === false) {
          JobHandler.DeleteJob(
            controller.room.name,
            JobHandler.CreateJob.GetUpgradeJobId(controller.pos)
          );
          JobHandler.CreateJob.CreateUpgradeJob(controller, true);
        } else if (!job) {
          JobHandler.CreateJob.CreateUpgradeJob(controller, true);
        }
      } else if (energyLeftToSpend > 50 * 1000) {
        return JobHandler.DeleteJob(controller.room.name, jobId);
      } else if (!job) {
        JobHandler.CreateJob.CreateUpgradeJob(controller);
      }
    }
  );

  public static ControlDamagedStructures = WrapperHandler.FuncWrapper(
    function ControlDamagedStructures(
      str: Structure,
      hasPriority = false
    ): void {
      if (
        StructureHelper.IsStructureDamaged(str) &&
        JobHandler.GetJob(
          JobHandler.CreateJob.GetRepairJobId(str),
          str.room.name
        ) === null
      )
        JobHandler.CreateJob.CreateRepairJob(str, hasPriority);
    }
  );
}
