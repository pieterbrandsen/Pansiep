import { isUndefined } from "lodash";
import { CreateBuildJob } from "../room/jobs/create";
import { GetStructuresInRange } from "../room/reading";
import { FunctionReturnCodes } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/functionStatusGenerator";
import { FuncWrapper } from "../utils/wrapper";
import ExecuteContainer from "./types/container";
import ExecuteController from "./types/controller";
import ExecuteExtension from "./types/extension";
import ExecuteFactory from "./types/factory";
import ExecuteLab from "./types/lab";
import ExecuteLink from "./types/link";
import ExecuteNuker from "./types/nuker";
import ExecuteObserver from "./types/observer";
import ExecuteRoad from "./types/road";
import { ExecuteSpawn } from "./types/spawn";
import ExecuteStorage from "./types/storage";
import ExecuteTerminal from "./types/terminal";
import { ExecuteTower } from "./types/tower";

/**
 * Update structure memory with inputted memory object. If no memory object is present, a new one will be created.
 *
 * @param { Id<Structure>} id - Location of file
 * @param {StructureMemory} mem - Args inputted
 * @return {FunctionReturn} HTTP response with code and data
 *
 * @example
 *
 *     UpdateStructureMemory(10023, structureMem)
 */
export const UpdateStructureMemory = FuncWrapper(function UpdateStructureMemory(
  id: Id<Structure>,
  mem: StructureMemory
) {
  Memory.structures[id] = mem;
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

/**
 * Get copy of the structure memory your trying to find. If it is not found it returns an NotFound code.
 *
 * @param { Id<Structure>} id - Location of file
 * @return {FunctionReturn} HTTP response with code and data
 *
 * @example
 *
 *     GetStructureMemory(10023)
 */
export const GetStructureMemory = FuncWrapper(function GetStructureMemory(
  id: Id<Structure>
): FunctionReturn {
  const strMem: StructureMemory | undefined = Memory.structures[id];
  if (isUndefined(strMem))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper(FunctionReturnCodes.OK, strMem);
});

/**
 * Get copy of all the structure memory id's of the roomName. If it is not found it returns an NotFound code.
 *
 * @param {string} roomName - Room name
 * @return {FunctionReturn} HTTP response with code and data
 *
 * @example
 *
 *     GetAllStructureIds("room1")
 */
export const GetAllStructureIds = FuncWrapper(function GetAllStructureIds(
  roomName: string
): FunctionReturn {
  const structureIds: string[] | undefined = Memory.cache.structures.data[
    roomName
  ]
    ? Memory.cache.structures.data[roomName].map((c) => c.id)
    : undefined;
  if (isUndefined(structureIds))
    return FunctionReturnHelper(FunctionReturnCodes.NOT_FOUND);
  return FunctionReturnHelper(FunctionReturnCodes.OK, structureIds);
});

/**
 * Build a structure in room and create build job.
 *
 * @param {Room} room - Room obj
 * @param {RoomPosition} pos - An room position
 * @param {StructureConstant} structureType - Type of structure you would like to build.
 * @param {boolean} [hasPriority] - Room obj
 * @return {FunctionReturn} HTTP response with code and data
 *
 */
export const BuildStructure = FuncWrapper(function BuildStructure(
  room: Room,
  pos: RoomPosition,
  structureType: StructureConstant,
  hasPriority = false
): FunctionReturn {
  let getStructuresInRange: FunctionReturn | undefined;
  switch (room.createConstructionSite(pos, structureType)) {
    case OK:
      CreateBuildJob(room, pos, structureType, hasPriority);
      return FunctionReturnHelper(FunctionReturnCodes.OK);
    case ERR_INVALID_TARGET:
      getStructuresInRange = GetStructuresInRange(pos, 0, room, [
        structureType,
      ]);

      if (
        getStructuresInRange.code === FunctionReturnCodes.OK &&
        getStructuresInRange.response.length > 0
      ) {
        return FunctionReturnHelper(getStructuresInRange.code);
      }
      break;
    default:
      break;
  }
  return FunctionReturnHelper(FunctionReturnCodes.NOT_MODIFIED);
});

/**
 * Run the structure, this function will run the correct structureType.
 *
 * @param {Structure} str - Location of file
 * @return {FunctionReturn} HTTP response with code and data
 *
 * @example
 *
 *     ExecuteStructure(anStructure)
 */
export const ExecuteStructure = FuncWrapper(function ExecuteStructure(
  str: Structure
): FunctionReturn {
  switch (str.structureType) {
    case STRUCTURE_CONTAINER:
      return ExecuteContainer(str as StructureContainer);
    case STRUCTURE_CONTROLLER:
      return ExecuteController(str as StructureController);
    case STRUCTURE_EXTENSION:
      return ExecuteExtension(str as StructureExtension);
    case STRUCTURE_FACTORY:
      return ExecuteFactory(str as StructureFactory);
    case STRUCTURE_LAB:
      return ExecuteLab(str as StructureLab);
    case STRUCTURE_LINK:
      return ExecuteLink(str as StructureLink);
    case STRUCTURE_NUKER:
      return ExecuteNuker(str as StructureNuker);
    case STRUCTURE_OBSERVER:
      return ExecuteObserver(str as StructureObserver);
    case STRUCTURE_SPAWN:
      return ExecuteSpawn(str as StructureSpawn);
    case STRUCTURE_STORAGE:
      return ExecuteStorage(str as StructureStorage);
    case STRUCTURE_TERMINAL:
      return ExecuteTerminal(str as StructureTerminal);
    case STRUCTURE_TOWER:
      return ExecuteTower(str as StructureTower);
    case STRUCTURE_ROAD:
      return ExecuteRoad(str as StructureRoad);
    default:
      return FunctionReturnHelper(FunctionReturnCodes.OK);
  }
});
