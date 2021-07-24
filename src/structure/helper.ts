import RoomHelper from "../room/helper";
import JobHandler from "../room/jobs/handler";
import StructureConstants from "../utils/constants/structure";
import UtilsHelper from "../utils/helper";
import WrapperHandler from "../utils/wrapper";
import ExecuteContainer from "./types/container";
import ExecuteController from "./types/controller";
import ExecuteExtension from "./types/extension";
import ExecuteFactory from "./types/factory";
import ExecuteLab from "./types/lab";
import ExecuteLink from "./types/link";
import ExecuteNuker from "./types/nuker";
import ExecuteObserver from "./types/observer";
import ExecuteRoad from "./types/road";
import ExecuteSpawnHandler from "./types/spawn";
import ExecuteStorage from "./types/storage";
import ExecuteTerminal from "./types/terminal";
import ExecuteTowerHandler from "./types/tower";

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
      const overflowAmount =
        (percentageFull - requiredPercentageFull) * (capacity / 100);
      return {
        hasOverflow:
          percentageFull < 100 ? percentageFull > requiredPercentageFull : true,
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
          ExecuteContainer(str as StructureContainer);
          break;
        case STRUCTURE_CONTROLLER:
          ExecuteController(str as StructureController);
          break;
        case STRUCTURE_EXTENSION:
          ExecuteExtension(str as StructureExtension);
          break;
        case STRUCTURE_FACTORY:
          ExecuteFactory(str as StructureFactory);
          break;
        case STRUCTURE_LAB:
          ExecuteLab(str as StructureLab);
          break;
        case STRUCTURE_LINK:
          ExecuteLink(str as StructureLink);
          break;
        case STRUCTURE_NUKER:
          ExecuteNuker(str as StructureNuker);
          break;
        case STRUCTURE_OBSERVER:
          ExecuteObserver(str as StructureObserver);
          break;
        case STRUCTURE_SPAWN:
          ExecuteSpawnHandler.ExecuteSpawn(str as StructureSpawn);
          break;
        case STRUCTURE_STORAGE:
          ExecuteStorage(str as StructureStorage);
          break;
        case STRUCTURE_TERMINAL:
          ExecuteTerminal(str as StructureTerminal);
          break;
        case STRUCTURE_TOWER:
          ExecuteTowerHandler.ExecuteTower(str as StructureTower);
          break;
        case STRUCTURE_ROAD:
          ExecuteRoad(str as StructureRoad);
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
        let isStructureFullEnough = StructureHelper.IsStructureFullEnough(
          str,
          0,
          RESOURCE_ENERGY
        );
        if (isStructureFullEnough.hasOverflow)
          JobHandler.CreateJob.CreateWithdrawJob(
            str,
            isStructureFullEnough.overflowAmount,
            RESOURCE_ENERGY,
            "withdrawController"
          );

        isStructureFullEnough = StructureHelper.IsStructureFullEnough(
          str,
          100,
          RESOURCE_ENERGY
        );
        if (!isStructureFullEnough.hasOverflow)
          JobHandler.CreateJob.CreateTransferJob(
            str,
            isStructureFullEnough.overflowAmount,
            RESOURCE_ENERGY,
            "transfer"
          );
      } else if (sourcesInRange.length > 0) {
        let isStructureFullEnough = StructureHelper.IsStructureFullEnough(
          str,
          0,
          RESOURCE_ENERGY
        );
        if (isStructureFullEnough.hasOverflow)
          JobHandler.CreateJob.CreateWithdrawJob(
            str,
            isStructureFullEnough.overflowAmount,
            RESOURCE_ENERGY,
            "withdraw"
          );
        isStructureFullEnough = StructureHelper.IsStructureFullEnough(
          str,
          100,
          RESOURCE_ENERGY
        );
        if (!isStructureFullEnough.hasOverflow)
          JobHandler.CreateJob.CreateTransferJob(
            str,
            isStructureFullEnough.overflowAmount,
            RESOURCE_ENERGY,
            "transferSource",
            false
          );
      } else {
        const isStructureFullEnough = StructureHelper.IsStructureFullEnough(
          str,
          50,
          RESOURCE_ENERGY
        );
        if (isStructureFullEnough.hasOverflow)
          JobHandler.CreateJob.CreateWithdrawJob(
            str,
            isStructureFullEnough.overflowAmount,
            RESOURCE_ENERGY,
            "withdraw"
          );
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
        const isStructureFullEnough = StructureHelper.IsStructureFullEnough(
          str,
          0,
          RESOURCE_ENERGY
        );
        if (isStructureFullEnough.hasOverflow)
          JobHandler.CreateJob.CreateWithdrawJob(
            str,
            isStructureFullEnough.overflowAmount,
            RESOURCE_ENERGY,
            "withdrawController"
          );
      } else if (sourcesInRange.length > 0) {
        let isStructureFullEnough = StructureHelper.IsStructureFullEnough(
          str,
          0,
          RESOURCE_ENERGY
        );
        if (isStructureFullEnough.hasOverflow)
          JobHandler.CreateJob.CreateWithdrawJob(
            str,
            isStructureFullEnough.overflowAmount,
            RESOURCE_ENERGY,
            "withdraw"
          );
        isStructureFullEnough = StructureHelper.IsStructureFullEnough(
          str,
          100,
          RESOURCE_ENERGY
        );
        if (!isStructureFullEnough.hasOverflow)
          JobHandler.CreateJob.CreateTransferJob(
            str,
            isStructureFullEnough.overflowAmount,
            RESOURCE_ENERGY,
            "transferSource",
            false
          );
      } else {
        const isStructureFullEnough = StructureHelper.IsStructureFullEnough(
          str,
          100,
          RESOURCE_ENERGY
        );
        if (isStructureFullEnough.hasOverflow)
          JobHandler.CreateJob.CreateWithdrawJob(
            str,
            isStructureFullEnough.overflowAmount,
            RESOURCE_ENERGY,
            "withdraw"
          );
      }
    }
  );

  /**
   * Control if the storage need to be filled/withdraw from
   */
  public static ControlStorageOfStorage = WrapperHandler.FuncWrapper(
    function ControlStorageOfStorage(str: StructureStorage): void {
      let isStructureFullEnough = StructureHelper.IsStructureFullEnough(
        str,
        50,
        RESOURCE_ENERGY
      );
      if (isStructureFullEnough.hasOverflow)
        JobHandler.CreateJob.CreateWithdrawJob(
          str,
          isStructureFullEnough.overflowAmount,
          RESOURCE_ENERGY,
          "withdraw"
        );
      isStructureFullEnough = StructureHelper.IsStructureFullEnough(
        str,
        20,
        RESOURCE_ENERGY
      );
      if (!isStructureFullEnough.hasOverflow)
        JobHandler.CreateJob.CreateTransferJob(
          str,
          isStructureFullEnough.overflowAmount,
          RESOURCE_ENERGY,
          "transfer"
        );
    }
  );

  /**
   * Control if the terminal need to be filled/withdraw from
   */
  public static ControlStorageOfTerminal = WrapperHandler.FuncWrapper(
    function ControlStorageOfTerminal(str: StructureTerminal): void {
      let isStructureFullEnough = StructureHelper.IsStructureFullEnough(
        str,
        35,
        RESOURCE_ENERGY
      );
      if (isStructureFullEnough.hasOverflow)
        JobHandler.CreateJob.CreateWithdrawJob(
          str,
          isStructureFullEnough.overflowAmount,
          RESOURCE_ENERGY,
          "withdraw"
        );
      isStructureFullEnough = StructureHelper.IsStructureFullEnough(
        str,
        20,
        RESOURCE_ENERGY
      );
      if (!isStructureFullEnough.hasOverflow)
        JobHandler.CreateJob.CreateTransferJob(
          str,
          isStructureFullEnough.overflowAmount,
          RESOURCE_ENERGY,
          "transfer",
          true
        );
    }
  );

  /**
   *
   */
  public static KeepStructureFullEnough = WrapperHandler.FuncWrapper(
    function KeepStructureFullEnough(
      str: Structure,
      requiredPercentageFull: number,
      resourceType: ResourceConstant = RESOURCE_ENERGY,
      hasPriority = false
    ): void {
      const isStructureFullEnough = StructureHelper.IsStructureFullEnough(
        str,
        requiredPercentageFull,
        resourceType
      );
      if (!isStructureFullEnough.hasOverflow)
        JobHandler.CreateJob.CreateTransferJob(
          str,
          isStructureFullEnough.overflowAmount,
          RESOURCE_ENERGY,
          hasPriority
        );
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
        "upgrade",
      ]);
      const upgradeJobs: Job[] = spendJobs.filter(
        (j) => j.action === "upgrade"
      );

      // TODO: When energy is low and not near downgrade, delete upgrade job

      if (upgradeJobs.length === 0) {
        JobHandler.CreateJob.CreateUpgradeJob(controller, true);
      } else if (spendJobs.length === 0) {
        JobHandler.CreateJob.CreateUpgradeJob(controller);
      } else if (
        (controller.room.controller as StructureController).ticksToDowngrade <
        10 * 1000
      ) {
        JobHandler.DeleteJob(spendJobs[0].id, controller.room.name);
        JobHandler.CreateJob.CreateUpgradeJob(controller, true);
      }
    }
  );
}
