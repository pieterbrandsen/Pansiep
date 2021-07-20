import JobHandler from "../room/jobs/handler";
import FuncWrapper from "../utils/wrapper";
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

export default class StructureHelper {
  // /**
  //  * Update structure memory with inputted memory object. If no memory object is present, a new one will be created.
  //  */
  // public static UpdateStructureMemory = FuncWrapper(function UpdateStructureMemory(
  //   id: Id<Structure>,
  //   mem: StructureMemory
  // ) {
  //   Memory.structures[id] = mem;
  //   return FunctionReturnHelper(FunctionReturnCodes.OK);
  // });

  /**
   * Get copy of the structure memory your trying to find. If it is not found it returns an NotFound code.
   */
  public static GetStructureMemory = FuncWrapper(function GetStructureMemory(
    id: Id<Structure>
  ): StructureMemory {
    const strMem: StructureMemory = Memory.structures[id];
    return strMem;
  });

  /**
   * Get copy of all the structure memory id's of the roomName. If it is not found it returns an NotFound code.
   */
  public static GetAllStructureIds = FuncWrapper(function GetAllStructureIds(
    roomName: string
  ): Id<Structure>[] {
    const structureIds: string[] = Memory.cache.structures.data[roomName]
      ? Memory.cache.structures.data[roomName].map((c) => c.id)
      : [];

    return structureIds as Id<Structure>[];
  });

  /**
   * Build a structure in room and create build job.
   */
  public static BuildStructure = FuncWrapper(function BuildStructure(
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
  });

  /**
   * Run the structure, this function will run the correct structureType.
   */
  public static ExecuteStructure = FuncWrapper(function ExecuteStructure(
    str: Structure
  ): void {
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
  });
}
