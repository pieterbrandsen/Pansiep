import { forEach } from "lodash";
import { GetAllStructureIds, ExecuteStructure } from "./helper";
import { IsStructureMemoryInitialized } from "../memory/initialization";
import { StructureStatsPreProcessing } from "../memory/stats";
import { FuncWrapper } from "../utils/wrapper";
import { FunctionReturnCodes } from "../utils/constants/global";
import { FunctionReturnHelper } from "../utils/functionStatusGenerator";
import { GetObject } from "../utils/helper";

/**
 * Execute an structure using its ID.
 *
 * @param {Id<Structure>} id - Id of structure
 * @return {FunctionReturn} HTTP response with code and data
 *
 * @example
 *     RunStructure(44454)
 */
export const RunStructure = FuncWrapper(function RunStructure(
  id: Id<Structure>
): FunctionReturn {
  const getObject = GetObject(id);
  if (getObject.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);
  const str: Structure = getObject.response;

  StructureStatsPreProcessing(str);
  ExecuteStructure(str);
  return FunctionReturnHelper(FunctionReturnCodes.OK);
});

/**
 * Execute all structures in room using room name as id.
 *
 * @param {string} roomId - Name of room as id
 * @return {FunctionReturn} HTTP response with code and data
 *
 * @example
 *     Run("roomName")
 */
export const Run = FuncWrapper(function RunStructures(
  roomId: string
): FunctionReturn {
  const getStructureIds = GetAllStructureIds(roomId);
  if (getStructureIds.code !== FunctionReturnCodes.OK)
    return FunctionReturnHelper(FunctionReturnCodes.NO_CONTENT);

  forEach(getStructureIds.response, (id: Id<Structure>) => {
    const isStructureMemoryInitialized = IsStructureMemoryInitialized(id);
    if (isStructureMemoryInitialized.code === FunctionReturnCodes.OK)
      RunStructure(id);
  });

  return FunctionReturnHelper(FunctionReturnCodes.OK);
});
